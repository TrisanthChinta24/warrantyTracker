// === routes/ocrRoutes.js ===

const express = require("express");
const router = express.Router();
const { extractText } = require("../services/ocrService");
const { parseOCRData } = require("../utils/ocrParser");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const diskUpload = require("../middlewares/upload"); // Use disk-based upload
const fs = require('fs'); // Node's File System module

// REMOVED: const upload = multer({ storage: multer.memoryStorage() }); 

router.post("/", AuthMiddleware, diskUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image provided" });
    
    const filePath = req.file.path;
    const fileMimeType = req.file.mimetype;
    
    console.log("OCR received file:", req.file.originalname, "Type:", fileMimeType);

    // Read the file buffer from the disk location
    const fileBuffer = fs.readFileSync(filePath);

    // Check for PDF and handle conversion if necessary in extractText, 
    // but pass the buffer for the service to handle.
    const text = await extractText(fileBuffer, { lang: "eng", mimetype: fileMimeType });
    const structuredData = parseOCRData(text);
    
    // Delete the file immediately after processing
    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete OCR temp file:", err);
    });

    res.json({
      success: true,
      text,
      extracted: structuredData,
    });
  } catch (err) {
    console.error("OCR processing failed:", err.message, err.stack); // Log full error for debugging
    
    // Always attempt to clean up the file if it exists and an error occurred
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (e) => {
            if (e) console.error("Failed to delete temp file after OCR crash:", e);
        });
    }
    
    res.status(500).json({ success: false, message: "OCR failed", error: err.message });
  }
});

module.exports = router;