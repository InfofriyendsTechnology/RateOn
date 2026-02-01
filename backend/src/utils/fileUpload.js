import { PORT } from '../config/config.js';

export const getFileUrl = (file) => {
    if (!file) return null;
    return `http://localhost:${PORT}/uploads/${file.filename}`;
};

export const getFileUrls = (files) => {
    if (!files || !Array.isArray(files)) return [];
    return files.map(file => getFileUrl(file));
};

export const getFilenameFromUrl = (url) => {
    if (!url) return null;
    return url.split('/').pop();
};

export default {
    getFileUrl,
    getFileUrls,
    getFilenameFromUrl
};
