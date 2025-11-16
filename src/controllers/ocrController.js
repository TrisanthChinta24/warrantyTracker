const ocrService = require('../services/ocrService');
const { findDates, findSerials } = require('../utils/ocrParser');

exports.runOCR = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ error: 'No image uploaded' });
    const { text } = await ocrService.extractText(req.file.buffer, { lang: 'eng' });
    const dates = findDates(text);
    const serials = findSerials(text);
    res.json({ text, dates, serials });
  } catch (err) {
    console.error('OCR error', err);
    res.status(500).json({ error: 'OCR failed', details: err.message });
  }
};
