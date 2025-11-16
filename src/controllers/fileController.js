const fs = require('fs');
const path = require('path');

const serveFileForDownload = (req, res) => {
    try {
        const filePath = req.query.path || req.params.filePath; 
        
        if (!filePath || !filePath.startsWith('uploads/')) {
            return res.status(400).send('Invalid file path.');
        }

        const fullDiskPath = path.join(__dirname, '..', '..', filePath); 
        
        if (!fs.existsSync(fullDiskPath)) {
            return res.status(404).send('File not found.');
        }

        const fileName = path.basename(fullDiskPath);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        res.sendFile(fullDiskPath);

    } catch (err) {
        console.error("Error serving file for download:", err);
        res.status(500).send('Server error serving file.');
    }
};

module.exports = { serveFileForDownload };