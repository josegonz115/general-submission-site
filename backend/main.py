from fastapi import FastAPI, File, HTTPException, UploadFile, Path
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from starlette.requests import Request
import subprocess
import os
from config import ROOT_DIR
import logging
from datetime import datetime
import mimetypes
from fastapi.middleware.cors import CORSMiddleware

# run the server with: uvicorn main:app --reload
# proeductiion: uvicorn backend.main:app --host 0.0.0.0 --port $PORT

app = FastAPI()

assets_directory = os.path.join(ROOT_DIR, "frontend/dist/assets")
public_directory = os.path.join(ROOT_DIR, "frontend/public")
app.mount("/assets", StaticFiles(directory=assets_directory), name="assets")
app.mount("/public", StaticFiles(directory=public_directory), name="public")

templates = Jinja2Templates(directory=os.path.join(ROOT_DIR, "frontend/dist"))

if os.getenv("NODE_ENV") == "development":
    # for DEVELOPMENT ONLY
    origins = [
        'http://localhost:5173',
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # END DEVELOPMENT


import os

UPLOAD_DIR = os.path.join(ROOT_DIR, "backend/uploads")
OUTPUT_DIR = os.path.join(ROOT_DIR, "backend/outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/upload", response_class=JSONResponse)
async def upload_file(file: UploadFile = File(...)):
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
        filename = f"{base_filename}_{counter}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        counter += 1
    with open(file_path, "wb") as f:
        f.write(content)
    # Run backend script
    try:
        result = subprocess.run(
            ['bash', 'backend.sh', file_path],
            capture_output=True,
            text=True,
            check=True,
            cwd=os.path.join(ROOT_DIR, "backend")
        )
        output = result.stdout
        logger.info(f"Script output: {output}")
    except subprocess.CalledProcessError as e:
        output = e.stderr
        logger.error(f"Script error: {output}")
        return JSONResponse(content={"error": output}, status_code=500)
    # Save output (optional)
    output_file = os.path.join(OUTPUT_DIR, f"{filename}_output.txt")
    with open(output_file, "w") as f:
        f.write(output)
    # return output
    return JSONResponse(content={"output": output})

@app.get("/api/outputs", response_class=JSONResponse)
def get_outputs():
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
def get_uploads():
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
def delete_file(dir_type: str = Path(..., pattern="^(outputs|uploads)$"), filename: str = Path(...)):
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
def download_file(dir_type: str = Path(..., pattern="^(outputs|uploads)$"), filename: str = Path(...)):
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
def get_file_content(dir_type: str = Path(..., pattern="^(outputs|uploads)$"), filename: str = Path(...)):
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
    if not filename.endswith(('.txt', '.csv', '.log', '.json', '.html')):  # Add any other text-based extensions
        raise HTTPException(status_code=400, detail="File type not supported for preview")
    # Read and return the file content
    with open(file_path, 'r') as file:
        content = file.read()
    # return content
    return JSONResponse(content={"content": content})