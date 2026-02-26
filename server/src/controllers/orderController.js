import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const calculateTotals = (itemsPrice) => {
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const shippingPrice = itemsPrice > 99 ? 0 : 9;
  const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

  return {
    taxPrice,
    shippingPrice,
    totalPrice,
  };
};

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || !orderItems.length) {
    res.status(400);
    throw new Error("No order items provided");
  }

  if (!shippingAddress?.fullName || !shippingAddress?.line1 || !shippingAddress?.city) {
    res.status(400);
    throw new Error("Shipping address is incomplete");
  }

  const savedItems = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const qty = Number(item.qty);

    if (!Number.isFinite(qty) || qty < 1) {
      res.status(400);
      throw new Error("Invalid order quantity");
    }

    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.stock < qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.title}`);
    }

    const finalPrice = product.salePrice || product.price;
    itemsPrice += finalPrice * qty;

    savedItems.push({
      product: product._id,
      name: product.title,
      image: product.images[0],
      qty,
      price: finalPrice,
    });
  }

  const totals = calculateTotals(itemsPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems: savedItems,
    shippingAddress,
    paymentMethod: paymentMethod || "COD",
    itemsPrice: Number(itemsPrice.toFixed(2)),
    taxPrice: totals.taxPrice,
    shippingPrice: totals.shippingPrice,
    totalPrice: totals.totalPrice,
  });

  for (const item of savedItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "title slug images");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json(order);
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const { status } = req.body;
  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  if (!ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  const previousStatus = order.status;
  order.status = status;

  if (status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  } else {
    order.isDelivered = false;
    order.deliveredAt = undefined;
  }

  if (status === "Processing" && !order.isPaid && order.paymentMethod === "COD") {
    order.isPaid = true;
    order.paidAt = new Date();
  }

  if (status === "Cancelled" && previousStatus !== "Cancelled" && previousStatus !== "Delivered") {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }
  }

  const updated = await order.save();
  res.json(updated);
});

export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update payment");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: req.body.id || "manual",
    status: req.body.status || "completed",
    updateTime: new Date().toISOString(),
    emailAddress: req.user.email,
  };

  const updated = await order.save();
  res.json(updated);
});
