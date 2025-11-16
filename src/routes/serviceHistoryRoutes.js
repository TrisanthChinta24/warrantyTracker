// routes/serviceHistoryRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const upload = require("../middlewares/upload");
const {
  createServiceRecord,
  getServiceRecords,
  getAllServiceRecords,
  updateServiceRecord,
  deleteServiceRecord
} = require("../controllers/serviceHistoryController");

router.post("/", authMiddleware, upload.array("documents", 5), createServiceRecord);
router.get("/:warrantyId", authMiddleware, getServiceRecords);
router.get("/", authMiddleware, getAllServiceRecords);
router.put("/:id", authMiddleware, upload.array("documents", 5), updateServiceRecord);
router.delete("/:id", authMiddleware, deleteServiceRecord);

module.exports = router;
