import { z } from 'zod';


// const checkFileType = (file: File) => {
//     if (file.name) {
//         const fileType = file.name.split(".").pop();
//         if (fileType === "py" || fileType === "sh") return true;
//     }
//     return false;
// };

const MAX_FILE_SIZE = 1024 * 1024 * 1; // 1MB
const ACCEPTED_FILE_TYPES = [
    'text/plain',       // .txt
    'application/x-sh', // .sh
    'text/x-python',    // .py
    'application/json', // .json
    'application/xml',  // .xml
    'text/csv',         // .csv
    'text/html',        // .html
    'text/css',         // .css
    'application/javascript', // .js
    'application/pdf',  // .pdf
    'image/jpeg',       // .jpeg
    'image/png',        // .png
    'image/gif',        // .gif
    'image/svg+xml',    // .svg
    'image/webp',       // .webp
    'image/tiff',       // .tiff
    'image/bmp',        // .bmp
    'image/vnd.microsoft.icon', // .ico
    'image/vnd.adobe.photoshop', // .psd
    'image/x-icon',     // .ico
    'image/vnd.dwg',    // .dwg
    'image/vnd.dxf',    // .dxf
    'image/vnd.fpx',    // .fpx
    'image/vnd.net-fpx', // .npx
    'image/vnd.rn-realpix', // .rp
    'image/vnd.wap.wbmp', // .wbmp
    'image/x-xbitmap',  // .xbm
    'image/x-xpixmap',  // .xpm
    'image/x-xwindowdump', // .xwd
    'image/x-portable-anymap', // .pnm
    'image/x-portable-bitmap', // .pbm
    'image/x-portable-graymap', // .pgm
    'image/x-portable-pixmap', // .ppm
];

export const fileSchema = z
    .custom<File>(file => file instanceof File)
    .refine(file => file.size <= MAX_FILE_SIZE, 'File size must be less than 1MB.')
    .refine(
        file => ACCEPTED_FILE_TYPES.includes(file.type),
        'Unsupported file type.'
    );
