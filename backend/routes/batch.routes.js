const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch.controller');

// CRUD
router.post('/', batchController.createBatch);
router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatchById);
router.put('/:id', batchController.updateBatch);
router.delete('/:id', batchController.deleteBatch);

// Extra: Add Subject to Batch
router.post('/:id/add-subject', batchController.addSubjectToBatch);

module.exports = router;
