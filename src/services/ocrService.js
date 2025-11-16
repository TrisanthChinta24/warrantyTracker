const fs = require("fs");
const path = require("path");
const os = require("os");
const tesseract = require("node-tesseract-ocr");
const { execSync } = require("child_process");
const pdfParse = require("pdf-parse");
// Choose the exported function: use .default if available, otherwise use the module itself
const pdf = typeof pdfParse === 'function' ? pdfParse : pdfParse.default; 
// --- END FIX ---
// Utility to recursively remove directory and its contents
function rmdirSync(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { 
                rmdirSync(curPath);
            } else { 
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}


// OCR function (handles both images & PDFs)
async function extractText(fileBuffer, options = { lang: "eng", mimetype: "" }) {
  try {
    if (options.mimetype === "application/pdf") {
      return await extractTextFromPDF(fileBuffer, options);
    } else {
      return await extractTextFromImage(fileBuffer, options);
    }
  } catch (err) {
    console.error("OCR extraction failed:", err);
    throw err;
  }
}

// 1️⃣ Extract text from IMAGE files
async function extractTextFromImage(imageBuffer, options = { lang: "eng" }) {
  // Use a unique file name in the temp directory
  const tempFilePath = path.join(os.tmpdir(), `ocr-${Date.now()}-${Math.random()}.png`);
  fs.writeFileSync(tempFilePath, imageBuffer);

  try {
    const config = { lang: options.lang || "eng", oem: 1, psm: 3 };
    const text = await tesseract.recognize(tempFilePath, config);
    return text;
  } finally {
    // Ensure cleanup
    try {
        fs.unlinkSync(tempFilePath);
    } catch(e) {
        console.error("Image OCR cleanup failed:", e);
    }
  }
}

// 2️⃣ Extract text from PDF files
async function extractTextFromPDF(fileBuffer, options = { lang: "eng" }) {
  // Use a unique file name in the temp directory
  const tempPDF = path.join(os.tmpdir(), `ocr-${Date.now()}-${Math.random()}.pdf`);
  fs.writeFileSync(tempPDF, fileBuffer);
  
  // Define outputDir here so it's accessible in finally block
  const outputDir = path.join(os.tmpdir(), `pdf-${Date.now()}-${Math.random()}`); 

  try {
    // 1. First try extracting directly (for text-based PDFs)
    const data = await pdf(fileBuffer);
    if (data.text.trim().length > 10) {
      return data.text;
    }

    // 2. If text is too short, convert pages to images and OCR them
    fs.mkdirSync(outputDir);

    // Convert PDF to image(s) using pdftoppm (requires Poppler utils)
    // NOTE: -png creates image/page-000001.png, page-000002.png...
    execSync(`pdftoppm -png "${tempPDF}" "${outputDir}/page"`);

    const files = fs.readdirSync(outputDir);
    let fullText = "";

    for (const file of files) {
      if (file.endsWith(".png")) {
        const imagePath = path.join(outputDir, file);
        const text = await tesseract.recognize(imagePath, {
          lang: options.lang || "eng",
          oem: 1,
          psm: 3,
        });
        fullText += `\n${text}`;
      }
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF OCR failed:", err);
    throw err; // Re-throw the error to be caught by the router
  } finally {
    // CRITICAL CLEANUP
    try {
        // Delete temporary PDF file
        fs.unlinkSync(tempPDF);
        
        // Recursively delete temporary image directory
        if (fs.existsSync(outputDir)) {
            rmdirSync(outputDir);
        }
    } catch (cleanupErr) {
        console.error("Failed during PDF OCR cleanup:", cleanupErr);
    }
  }
}

// 3️⃣ Find dates
function findDates(text) {
  const dateRegex =
    /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}\s?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{2,4})\b/gi;
  return text.match(dateRegex) || [];
}

// 4️⃣ Find serials
function findSerials(text) {
  const serialRegex = /\b[A-Z0-9\/\-]{6,}\b/g;
  return text.match(serialRegex) || [];
}

module.exports = {
  extractText,
  findDates,
  findSerials,
};