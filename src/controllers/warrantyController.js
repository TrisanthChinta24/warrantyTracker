const Warranty = require("../models/WarrantyItem");

const createWarranty = async (req, res) => {
  try {
    const { productName, purchaseDate, expiryDate, vendor, notes, warrantyPeriodMonths, customTitles } = req.body;

    const titlesArray = JSON.parse(customTitles || '[]');
    const imageAttachments = req.files ? req.files.map((file, index) => ({
      path: file.path,
      originalName: file.originalname,
      customName: titlesArray[index] || file.originalname, 
    })) : [];
    const warranty = new Warranty({
      productName,
      purchaseDate,
      expiryDate,
      vendor,
      notes,
      warrantyPeriodMonths,
      images: imageAttachments,
      user: req.user.id, 
    });

    await warranty.save();
    res.status(201).json(warranty);
  } catch (err) {
    console.error("Error creating warranty:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find({ user: req.user.id });
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getWarrantyById = async (req, res) => {
  try {
    const warranty = await Warranty.findOne({ _id: req.params.id, user: req.user.id });
    if (!warranty) return res.status(404).json({ message: "Warranty not found" });
    res.json(warranty);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateWarranty = async (req, res) => {
  try {
    const updates = req.body;

    if (req.files) {
      const titlesArray = JSON.parse(req.body.customTitles || '[]');
      const newAttachments = req.files.map((file, index) => ({
          path: file.path,
          originalName: file.originalname,
          customName: titlesArray[index] || file.originalname,
      }));
      
      updates.$push = { images: { $each: newAttachments } };    
    }
    delete updates.customTitles; 

    const warranty = await Warranty.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!warranty) return res.status(404).json({ message: "Warranty not found" });

    res.json(warranty);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!warranty) return res.status(404).json({ message: "Warranty not found" });

    res.json({ message: "Warranty deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateAttachmentTitle = async (req, res) => {
    try {
        const { index, newName } = req.body;
        
        const fieldToUpdate = `images.${index}.customName`;

        const warranty = await Warranty.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: { [fieldToUpdate]: newName } },
            { new: true }
        );

        if (!warranty) return res.status(404).json({ message: "Warranty not found" });

        res.json({ success: true, message: "Attachment title updated." });
    } catch (err) {
        console.error("Error updating attachment title:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const fs = require('fs');
const path = require('path');

const deleteAttachment = async (req, res) => {
    try {
        const { index, diskPath } = req.body;
        
        const warranty = await Warranty.findOne({ _id: req.params.id, user: req.user.id });
        if (!warranty) return res.status(404).json({ message: "Warranty not found" });

        // 1. Remove the entry from the database array using the index
        if (warranty.images && warranty.images[index]) {
            warranty.images.splice(index, 1);
        } else {
            return res.status(400).json({ message: "Invalid attachment index" });
        }
     
        const fullDiskPath = path.join(__dirname, '..', '..', diskPath); 
        
        fs.unlink(fullDiskPath, (err) => {
            if (err) console.error("Failed to delete attachment file from disk:", fullDiskPath, err);
        });

        await warranty.save();
        
        res.json({ success: true, message: "Attachment deleted successfully" });
    } catch (err) {
        console.error("Error deleting attachment:", err);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
  createWarranty,
  getWarranties,
  getWarrantyById,
  updateWarranty,
  deleteWarranty,
  deleteAttachment,
  updateAttachmentTitle
};
