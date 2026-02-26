import express from "express";
import {
  deleteUserByAdmin,
  getProfile,
  getUsers,
  loginUser,
  registerUser,
  updateProfile,
  updateUserByAdmin,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router
  .route("/profile")
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route("/users").get(protect, adminOnly, getUsers);
router
  .route("/users/:id")
  .put(protect, adminOnly, updateUserByAdmin)
  .delete(protect, adminOnly, deleteUserByAdmin);

export default router;
