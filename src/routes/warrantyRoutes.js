const express = require("express");
const router = express.Router();
const warrantyController = require("../controllers/warrantyController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const upload = require("../middlewares/upload");

// Protected Routes
router.post("/", authMiddleware, upload.array("images", 5), warrantyController.createWarranty);
router.put("/:id", authMiddleware, upload.array("images", 5), warrantyController.updateWarranty);
router.put("/:id/attachment/name", authMiddleware, warrantyController.updateAttachmentTitle);

router.get("/", authMiddleware, warrantyController.getWarranties);
router.get("/:id", authMiddleware, warrantyController.getWarrantyById);
router.delete("/:id", authMiddleware, warrantyController.deleteWarranty);
router.delete("/:id/attachment", authMiddleware, warrantyController.deleteAttachment);

module.exports = router;


