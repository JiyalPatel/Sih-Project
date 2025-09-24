const express = require("express");
const {
    createHOD,
    getHODs,
    getHODById,
    deleteHOD,
} = require("../controllers/hod.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
const allowedRoles = ["admin", "institute"];

router.post("/", protect, authorizeRoles(...allowedRoles), createHOD);
router.get("/", protect, authorizeRoles(...allowedRoles), getHODs);
router.get("/:id", protect, authorizeRoles(...allowedRoles), getHODById);
router.delete("/:id", protect, authorizeRoles(...allowedRoles), deleteHOD);

module.exports = router;