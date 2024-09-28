import {
    Dropzone,
    ExtFile,
    FileMosaic,
    FileMosaicProps,
    UploadConfig,
} from "@files-ui/react";
import { useState } from "react";
import { BASE_URL, MAX_FILE_SIZE } from "@/api/api";
import { Button } from "./ui/button";

type FileUploadProps = {
    onUploadMessage: (message: string | null) => void;
};
export default function FileUpload({ onUploadMessage }: FileUploadProps) {
    const [extFiles, setExtFiles] = useState<ExtFile[]>([]);
    const [jobFinished, setJobFinished] = useState(false);
    const updateFiles = (incommingFiles: ExtFile[]) => {
        console.log("incomming files", incommingFiles);
        setExtFiles(incommingFiles);
    };
    const onDelete = (id: FileMosaicProps["id"]) => {
        setExtFiles(extFiles.filter((x) => x.id !== id));
        setJobFinished(false);
        onUploadMessage(null);
    };
    const handleStart = (filesToUpload: ExtFile[]) => {
        setJobFinished(false);
        console.log("advanced demo start upload", filesToUpload);
    };
    const handleFinish = (uploadedFiles: ExtFile[]) => {
        setJobFinished(true);
        if (uploadedFiles.length === 0 || !uploadedFiles[0].serverResponse || !uploadedFiles[0].serverResponse.payload.output_file) {
            if (uploadedFiles[0].errors && uploadedFiles[0].errors.length > 0) {
                onUploadMessage(uploadedFiles[0].errors[0]);
                return;
            }
            onUploadMessage(uploadedFiles[0].serverResponse?.payload.error || "Upload failed");
            return;
        }
        const apiResult = uploadedFiles[0].serverResponse.payload.output_file;
        onUploadMessage(`Output File: ${apiResult}`);
        console.log("advanced demo finish upload", uploadedFiles);
    };
    const handleAbort = (id: FileMosaicProps["id"]) => {
        setExtFiles(
            extFiles.map((ef) => {
                if (ef.id === id) {
                    return { ...ef, uploadStatus: "aborted" };
                } else return { ...ef };
            })
        );
        setJobFinished(false);
    };
    const handleCancel = (id: FileMosaicProps["id"]) => {
        setExtFiles(
            extFiles.map((ef) => {
                if (ef.id === id) {
                    return { ...ef, uploadStatus: undefined };
                } else return { ...ef };
            })
        );
        setJobFinished(false);
    };

    const uploadConfig: UploadConfig = {
        // autoUpload: true
        url: BASE_URL + "/api/upload",
        cleanOnUpload: true,
    };


    return (
        <>
            <Dropzone
                onChange={updateFiles}
                minHeight="195px"
                value={extFiles}
                maxFiles={1}
                maxFileSize={MAX_FILE_SIZE}
                label="Drag'n drop files here or click to browse"
                // accept="any except image/*, video/*"
                uploadConfig={uploadConfig}
                onUploadStart={handleStart}
                onUploadFinish={handleFinish}
                actionButtons={{
                    position: "after",
                    abortButton: {},
                    deleteButton: jobFinished ? undefined : {
                        children: <Button className="w-full h-full bg-red-700 hover:bg-red-800">Delete</Button>,
                        className: "m-0 p-0",
                        resetStyles: true,
                    },
                    uploadButton: jobFinished ? undefined :{
                        children: <Button className="w-full h-full ">Upload</Button>,
                        className: "m-0 p-0",
                        resetStyles: true,
                    },
                }}
            >
                {extFiles.map((file) => (
                    <FileMosaic
                        {...file}
                        key={file.id}
                        onDelete={onDelete}
                        onAbort={handleAbort}
                        onCancel={handleCancel}
                        resultOnTooltip
                        alwaysActive
                        preview
                        info
                    />
                ))}
            </Dropzone>
        </>
    );
}