// backend/routes/batch.routes.js
const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batch.controller");

// ---------- Batch Routes ----------

// Get all batches
router.get("/", batchController.getBatches);

// Get single batch by ID
router.get("/:id", batchController.getBatchById);

// Create new batch
router.post("/", batchController.createBatch);

// Update batch by ID
router.put("/:id", batchController.updateBatch);

// Delete batch by ID
router.delete("/:id", batchController.deleteBatch);

module.exports = router;
