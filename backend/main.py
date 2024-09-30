from fastapi import Depends, FastAPI, File, HTTPException, Security, UploadFile, Path
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import APIKeyHeader
from starlette.status import HTTP_403_FORBIDDEN
import subprocess
import os
import logging
from datetime import datetime
import mimetypes
from fastapi.middleware.cors import CORSMiddleware

# run the server with: NODE_ENV=development uvicorn main:app --reload
# proeductiion: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
# python3 -m uvicorn main:app 
# fastapi run main.py

app = FastAPI()
API_KEY_NAME = "X-API-Key"
API_KEY_HEADER = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
VALID_API_KEYS = [os.getenv("API_KEY")]

async def get_api_key(api_key_header: str = Security(API_KEY_HEADER)):
    if api_key_header in VALID_API_KEYS:
        return api_key_header
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Could not validate API key"
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        #'http://localhost:5173',
        'https://general-submission-site.onrender.com',
        'https://web-drive-submission-api.online',
        'https://www.web-drive-submission-api.online',  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/upload", response_class=JSONResponse)
async def upload_file(file: UploadFile = File(...), api_key: str = Depends(get_api_key)):
    # Check file size (max 1MB)
    content = await file.read()
    if len(content) > 1 * 1024 * 1024:
        return "File is too large. Maximum size is 1MB."
    # Save uploaded file
    filename = file.filename
    file_path = os.path.join(UPLOAD_DIR, filename)
    counter = 1
    base_filename, file_extension = os.path.splitext(filename)
    while os.path.exists(file_path):
        # filename = f"{base_filename}_{counter}{file_extension}"
        filename = f"{base_filename} ({counter}){file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        counter += 1
    with open(file_path, "wb") as f:
        f.write(content)
    try:
        result = subprocess.run(
            ['bash', 'backend.sh', file_path],
            capture_output=True,
            text=True,
            check=True
            )
        
        output = result.stdout
        logger.info(f"Script output: {output}")
    except subprocess.CalledProcessError as e:
        output = e.stderr
        logger.error(f"Script error: {output}")
        raise HTTPException(status_code=500, detail=output)
    # output_file = os.path.join(OUTPUT_DIR, f"{filename}_output.txt")
    base_filename, file_extension = os.path.splitext(filename)
    output_filename = f"{base_filename}_output{file_extension}"
    output_file = os.path.join(OUTPUT_DIR, output_filename)

    output_file_basename = os.path.basename(output_file)
    with open(output_file, "w") as f:
        f.write(output)
    # return output
    return JSONResponse(content={"output": output, "output_file": output_file_basename})

@app.get("/api/outputs", response_class=JSONResponse)
def get_outputs(api_key: str = Depends(get_api_key)):
    outputs = []
    for filename in os.listdir(OUTPUT_DIR):
        file_path = os.path.join(OUTPUT_DIR, filename)
        if os.path.isfile(file_path):
            # Get file metadata
            file_stats = os.stat(file_path)
            file_size = file_stats.st_size  # in bytes
            creation_time = datetime.fromtimestamp(file_stats.st_ctime)
            # Build metadata dictionary
            outputs.append({
                "filename": filename,
                "size": file_size,
                "creation_time": creation_time.isoformat(),
                "download_url": f"/api/outputs/{filename}",
                "type": mimetypes.guess_type(file_path)[0]
            })
    return {"outputs": outputs}

@app.get("/api/uploads", response_class=JSONResponse)
def get_uploads(api_key: str = Depends(get_api_key)):
    uploads = []
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(file_path):
            # Get file metadata
            file_stats = os.stat(file_path)
            file_size = file_stats.st_size
            creation_time = datetime.fromtimestamp(file_stats.st_ctime)
            # Build metadata dictionary
            uploads.append({
                "filename": filename,
                "size": file_size,
                "creation_time": creation_time.isoformat(),
                "download_url": f"/api/uploads/{filename}",
                "type": mimetypes.guess_type(file_path)[0]
            })
    return {"uploads": uploads}

@app.delete("/api/{dir_type}/{filename}", response_class=JSONResponse)
def delete_file(dir_type: str = Path(..., pattern="^(outputs|uploads)$"), filename: str = Path(...), api_key: str = Depends(get_api_key)):
    if dir_type == "outputs":
        directory = OUTPUT_DIR
    elif dir_type == "uploads":
        directory = UPLOAD_DIR
    else:
        raise HTTPException(status_code=400, detail="Invalid directory type")
    file_path = os.path.join(directory, filename)
    # file_deleted = False
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    os.remove(file_path)
    return JSONResponse(content={"message": "File deleted"}, status_code=200)

@app.get("/api/{dir_type}/{filename}", response_class=FileResponse)
def download_file(dir_type: str = Path(..., pattern="^(outputs|uploads)$"), filename: str = Path(...), api_key: str = Depends(get_api_key)):
    # Determine the directory based on dir_type
    if dir_type == "outputs":
        directory = OUTPUT_DIR
    elif dir_type == "uploads":
        directory = UPLOAD_DIR
    else:
        raise HTTPException(status_code=400, detail="Invalid directory type")
    file_path = os.path.join(directory, filename)
    # Security check: Ensure the file exists and is within the specified directory
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    # Optionally, check if the filename is safe
    if '..' in filename or filename.startswith('/'):
        raise HTTPException(status_code=400, detail="Invalid filename")
    # Determine the content type (MIME type) based on the file extension
    content_type, _ = mimetypes.guess_type(file_path)
    # Set headers to prompt download or inline display
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return FileResponse(path=file_path, media_type=content_type, headers=headers)


@app.get("/api/{dir_type}/{filename}/content", response_class=JSONResponse)
def get_file_content(dir_type: str = Path(..., pattern="^(outputs|uploads)$"), filename: str = Path(...), api_key: str = Depends(get_api_key)):
    if dir_type == "outputs":
        directory = OUTPUT_DIR
    elif dir_type == "uploads":
        directory = UPLOAD_DIR
    else:
        raise HTTPException(status_code=400, detail="Invalid directory type")
    file_path = os.path.join(directory, filename)
    # Ensure the file exists and is a text file
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    # Check if the file is a photo or video file type
    if dir_type == "uploads":
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type and mime_type.startswith(('image/', 'video/')):
            raise HTTPException(status_code=400, detail="Photo and video file types are not supported for preview")
    # Read and return the file content
    with open(file_path, 'r') as file:
        content = file.read()
    # return content
    return JSONResponse(content={"content": content})
