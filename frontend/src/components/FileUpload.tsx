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

export default function FileUpload() {
    const [extFiles, setExtFiles] = useState<ExtFile[]>([]);
    const [jobFinished, setJobFinished] = useState(false);
    const updateFiles = (incommingFiles: ExtFile[]) => {
        console.log("incomming files", incommingFiles);
        setExtFiles(incommingFiles);
    };
    const onDelete = (id: FileMosaicProps["id"]) => {
        setExtFiles(extFiles.filter((x) => x.id !== id));
    };
    const handleStart = (filesToUpload: ExtFile[]) => {
        setJobFinished(false);
        console.log("advanced demo start upload", filesToUpload);
    };
    const handleFinish = (uploadedFiles: ExtFile[]) => {
        setJobFinished(true);
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
    };
    const handleCancel = (id: FileMosaicProps["id"]) => {
        setExtFiles(
            extFiles.map((ef) => {
                if (ef.id === id) {
                    return { ...ef, uploadStatus: undefined };
                } else return { ...ef };
            })
        );
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