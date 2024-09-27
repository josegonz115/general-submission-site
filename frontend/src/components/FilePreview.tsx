// FilePreview.js
import { useState, useEffect, useRef } from 'react';
import { fetchFileContent } from '../api/api';

function FilePreview({ filename, onClose }: { filename: string; onClose: () => void }) {
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);


    useEffect(() => {
        fetchFileContent(filename)
            .then((data) => {
                if (data !== null) {
                    setContent(data.content);
                } else {
                    setError('Failed to fetch file content.');
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Error fetching file content.');
            });
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
        // <div>
        //     <h3>Preview of {filename}</h3>
        //     <button onClick={onClose}>Close Preview</button>
        //     <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#f5f5f5', padding: '10px' }}>
        //         {content}
        //     </pre>
        // </div>
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
                value={content}
                readOnly
                className="w-full min-h-[200px] resize-y border border-gray-300 rounded-md p-2 font-mono text-sm bg-gray-50 text-gray-800 overflow-auto focus:outline-none"
            />
        </div>
        
    );
}

export default FilePreview;