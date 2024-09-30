// FilePreview.js
import { useState, useEffect, useRef } from 'react';
import { fetchFileContent, FileContentError, FileContentResponse } from '../api/api';

function FilePreview({ filename, onClose }: { filename: string; onClose: () => void }) {
    const [content, setContent] = useState<string | null>('');
    const [error, setError] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);


    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data: FileContentResponse = await fetchFileContent(filename);
                setError(null);
                setContent(data.content);
            } catch (err) {
                const error = err as FileContentError;
                console.error(error);
                setError(error.detail);
                setContent(null);
            }
        };
        fetchContent();
    }, [filename]);


    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="relative p-4 border border-gray-300 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Preview of {filename}</h3>
            <button
                onClick={onClose}
                className="absolute top-2 right-2 px-2 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
                Close Preview
            </button>
            <textarea
                ref={textareaRef}
                value={content || ''}
                readOnly
                className="w-full min-h-[200px] max-h-[700px] resize-y border border-gray-300 rounded-md p-2 font-mono text-sm bg-gray-50 text-gray-800 overflow-auto focus:outline-none"
            />
        </div>
        
    );
}

export default FilePreview;