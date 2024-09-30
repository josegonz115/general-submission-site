import { useForm } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    Form,
} from "./ui/form";
import { fileSchema } from "@/schema/schema";
import { useState } from "react";
import { Button } from "./ui/button";
import FileUpload from "./FileUpload";
import { Link } from "@tanstack/react-router";
import Toast from "./Toast";
import { defaultHeaders } from "@/api/api";

const UploadForm = () => {
    const form = useForm();
    const [file] = useState<File | null>(null);
    // const [fileUploaded, setFileUploaded] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        if (!file) {
            console.error("No file selected.");
            return;
        }
        const result = fileSchema.safeParse(file);
        if (!result.success) {
            console.error(result.error.errors);
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const { 'X-API-Key': apiKey } = defaultHeaders;
            const response = await fetch("/api/upload", {
                //TESTING
                method: "POST",
                headers: { 'X-API-Key': apiKey },
                body: formData,
            });
            await response.json(); // TESTING
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleClosePreview = () => {
        setUploadMessage(null);
    };

    const handleUploadMessage = (message: string | null) => {
        setUploadMessage(message);
        // toast.success(message);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(() => handleSubmit)} className="space-y-8 w-1/2 mx-auto">
                <FormField
                    control={form.control}
                    name="username"
                    render={ () => (
                        <FormItem>
                            <FormControl>
                                <FileUpload onUploadMessage={handleUploadMessage}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Link to='/uploaded' className="mt-5"><Button type="submit" className="mt-5">Uploaded Page</Button></Link>
                {uploadMessage && (
                    <Toast message={uploadMessage} onClose={handleClosePreview} />
                )}
            </form>
        </Form>
    );
}

export default UploadForm;
