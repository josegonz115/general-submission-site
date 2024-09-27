//example output
// {
//     "output": "Checksum on checksum.c:\n10474\nmd5sum on input file:\nEdges:\n    8323 uploads/37bf0a1c-cd16-45f5-ae30-9231558b85a5_syeast0.el\nNodes:\n    1004\n"
// }
export const BASE_URL = import.meta.env.PROD ? window.location.origin : 'http://127.0.0.1:8000';

export const MAX_FILE_SIZE = 1048576; // 1 MB in bytes
const defaultHeaders = {
    "Content-Type": "application/json",
};
const myFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        ...defaultHeaders,
        ...options.headers,
    };
    const response = await fetch(url, {
        headers,
        ...options,
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
        console.log(URL + "/api/upload");//TESTING
        const data = await myFetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        const parsedData = parseOutput(data.output);
        console.log('parsedData', parsedData);//TESTING
        return parsedData;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
};

interface ProcessedOutput {
    checksum: number;
    edges: number;
    nodes: number;
    filePath: string;
}

const parseOutput = (output: string): ProcessedOutput => {
    const lines = output.split('\n');
    const checksum = parseInt(lines[1].trim(), 10);
    const edgesLine = lines.find(line => line.startsWith('    ')) || '';
    const edges = parseInt(edgesLine.split(' ')[1], 10);
    const filePath = edgesLine.split(' ')[2];
    const nodesLine = lines.find(line => line.startsWith('Nodes:')) || '';
    const nodes = parseInt(nodesLine.split(' ')[1], 10);

    return {
        checksum,
        edges,
        nodes,
        filePath
    };
};

type OutputFile = {
    filename: string;
    size: number; // maybe change to string
    creation_time: string;
    download_url: string;
    type: string;
};
type OutputFilesRequest = {
    outputs: OutputFile[];
};
type UploadFileRequest = {
    uploads: OutputFile[];
};
export const getOutputFiles = async () => {
    try {
        const data: OutputFilesRequest = await myFetch("/api/outputs");
        return data;
    } catch (error) {
        console.error("Error fetching output files:", error);
        return null;
    }
};
export const getUploadFiles = async () => {
    try {
        const data: UploadFileRequest = await myFetch("/api/uploads");
        return data;
    } catch (error) {
        console.error("Error fetching upload files:", error);
        return null;
    }
};


export const deleteFile = async (file_url: string) => {
    try {
        await myFetch(file_url, { method: "DELETE" });
    } catch (error) {
        console.error("Error deleting file:", error);
        return null;
    }
};

type FileContentResponse = {
    content: string;
};
export const fetchFileContent = async (filename: string) => {
    try {
        const data = await myFetch(filename + '/content');
        return data as FileContentResponse;
    } catch (error) {
        console.error("Error fetching file content:", error);
        return null;
    }
};

// export const acceptedFileExtensions = [
//     'txt',  // Text files
//     'py',   // Python files
//     'java', // Java files
//     'js',   // JavaScript files
//     'ts',   // TypeScript files
//     'html', // HTML files
//     'css',  // CSS files
//     'json', // JSON files
//     'xml',  // XML files
//     'md',   // Markdown files
//     'csv',  // CSV files
//     'sh',   // Shell script files
//     'yaml', // YAML files
//     'yml',  // YAML files
//     'log',  // Log files
//     'ini',  // INI configuration files
//     'conf', // Configuration files
//     'bat',  // Batch files
//     'php',  // PHP files
//     'rb',   // Ruby files
//     'pl',   // Perl files
//     'rs',   // Rust files
//     'go',   // Go files
//     'c',    // C files
//     'cpp',  // C++ files
//     'h',    // Header files
//     'hpp',  // C++ header files
//     'swift' // Swift files
// ];