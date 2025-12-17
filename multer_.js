import multer from "multer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from 'node:fs'

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        const uploadPath = `public/uploads/`;
        ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${Date.now()}-${name}${ext}`);
    }

})

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // Images
        'image/jpeg',
        'image/png',
        'image/webp',

        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];


    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('File type not allowed'), false);
    }
    
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.txt'];

    if (!allowedExts.includes(ext)) {
        return cb(new Error('File extension not allowed'), false);
    }

    cb(null, true);

};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 100MB per file
    }
});