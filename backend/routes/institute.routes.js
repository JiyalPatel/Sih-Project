const express = require("express");
const {
    createInstitute,
    getInstitutes,
    getInstituteById,
    updateInstitute,
    deleteInstitute,
} = require("../controllers/institute.controller");

const router = express.Router();

// Later we can add protect + authorizeRoles("admin") middleware here
router.post("/", createInstitute);
router.get("/", getInstitutes);
router.get("/:id", getInstituteById);
router.put("/:id", updateInstitute);
router.delete("/:id", deleteInstitute);

module.exports = router;
