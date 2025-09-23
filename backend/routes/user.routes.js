const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "institute"), getUsers);
router.get("/:id", protect, authorizeRoles("admin", "institute"), getUserById);
router.put("/:id", protect, authorizeRoles("admin", "institute"), updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
