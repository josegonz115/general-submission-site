import { Card, CardContent } from "@/components/ui/card"
import { ExtFile, FileMosaic, FileMosaicProps } from "@files-ui/react";
import { useState, useEffect } from "react";
import { deleteFile, getOutputFiles, getUploadFiles } from "@/api/api";
import FilePreview from "@/components/FilePreview";

const UploadedPage = () => {
  const [outputExtFiles, setOutputExtFiles] = useState<ExtFile[]>([]);
  const [uploadExtFiles, setUploadExtFiles] = useState<ExtFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ExtFile | null>(null);
  
  const onDelete = async(id: FileMosaicProps["id"]) => {
      try {
        const file = outputExtFiles
          .find((x) => x.id === id) || uploadExtFiles.find((x) => x.id === id);
        const file_url = file ? file.downloadUrl : null;
        if(!file_url) {
          throw new Error("downloadUrl not found");
        }
        await deleteFile(file_url);
        setOutputExtFiles(outputExtFiles.filter((x) => x.id !== id));
        setUploadExtFiles(uploadExtFiles.filter((x) => x.id !== id));
      } catch (error) {
        console.error("Error deleting file:", error);
      }
  };

  const handleClosePreview = () => {
      setSelectedFile(null);
  };


  useEffect(() => {
    const fetchOutputFiles = async () => {
      const outputFiles = await getOutputFiles();
      if(!outputFiles) {
        console.error("No files found");
        return;
      }
      const fileOutputs = outputFiles.outputs;
      const extFiles: ExtFile[] = fileOutputs.map((file) => {
        return {
          id: file.filename,
          name: file.filename,
          size: file.size,
          creation_time: file.creation_time,
          downloadUrl: file.download_url,
          type: file.type
        };
      });
      setOutputExtFiles(extFiles);  
    };
    const fetchUploadFiles = async () => {
      const uploadFiles = await getUploadFiles();
      if(!uploadFiles) {
        console.error("No files found");
        return;
      }
      const fileUploads = uploadFiles.uploads;
      const extFiles: ExtFile[] = fileUploads.map((file) => {
        return {
          id: file.filename,
          name: file.filename,
          size: file.size,
          creation_time: file.creation_time,
          downloadUrl: file.download_url,
          type: file.type
        };
      });
      setUploadExtFiles(extFiles);  
    }
    fetchOutputFiles();
    fetchUploadFiles();
  }, []);

  

  return (
    <div>
      <h1 className="my-4">Uploaded Files Page</h1>
      <Card>
        <CardContent className="flex flex-col gap-4 w-[80%] mx-auto">
        <h2 className="text-xl">Outputted Files</h2>
          {/* <div className="grid grid-flow-col p-4 shadow mx-auto w-full border border-gray-300"> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto shadow p-4 border w-full border-gray-300 justify-items-center">
            {outputExtFiles.map((file) => (
              <FileMosaic
                  {...file}
                  key={file.id}
                  onDelete={onDelete}
                  resultOnTooltip
                  alwaysActive
                  preview
                  info
                  onClick={() => setSelectedFile(file)}
              />
            ))}
          </div>

          <h2 className="text-xl">Uploaded Files</h2>
          {/* <div className="grid grid-flow-col mx-auto shadow p-4 border w-full border-gray-300"> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto shadow p-4 border w-full border-gray-300 justify-items-center">
            {uploadExtFiles.map((file) => (
              <FileMosaic
                  {...file}
                  key={file.id}
                  onDelete={onDelete}
                  resultOnTooltip
                  alwaysActive
                  preview
                  info
                  onClick={() => setSelectedFile(file)}
              />
            ))}
          </div>
        </CardContent>
        {selectedFile && selectedFile.downloadUrl && (
                <FilePreview filename={selectedFile.downloadUrl} onClose={handleClosePreview} />
        )}
      </Card>
    </div>
  )
}

export default UploadedPage;