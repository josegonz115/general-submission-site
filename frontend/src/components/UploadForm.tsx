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

const UploadForm = () => {
    const form = useForm();
    const [file] = useState<File | null>(null);

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
            const response = await fetch("/api/upload", {
                //TESTING
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            console.log(data); //TESTING
        } catch (error) {
            console.error("Error uploading file:", error);
        }
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
                                <FileUpload />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}

export default UploadForm;
