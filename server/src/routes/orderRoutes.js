import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  markOrderPaid,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, adminOnly, getOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, markOrderPaid);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
