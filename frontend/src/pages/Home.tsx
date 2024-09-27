import UploadForm from "../components/UploadForm";

const Home = () => {
    return (
        <div className="flex flex-col mt-8 gap-8">
            <h1>General Submission Homepage</h1>
            <div className="w-2/3 mx-auto">
                <p>Welcome to the home page!</p><p>The frontend allows users to upload files up to 1MB, which are then saved to the server with unique filenames to avoid conflicts.</p><p>The backend processes the uploaded file using a script (backend.sh), captures the script's output, and returns it to the frontend. If the script execution fails, an error message is returned instead.</p>
            </div>
            <UploadForm />
        </div>
    )
}

export default Home;