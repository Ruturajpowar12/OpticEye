import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const normalizeEmail = (email) => email?.toString().trim().toLowerCase();

const mapUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  avatar: user.avatar,
  address: user.address,
  createdAt: user.createdAt,
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const user = await User.create({ name, email: normalizedEmail, password });

  res.status(201).json({
    user: mapUser(user),
    token: generateToken(user._id),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    user: mapUser(user),
    token: generateToken(user._id),
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(mapUser(req.user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.avatar = req.body.avatar || user.avatar;

  if (req.body.email) {
    const normalizedEmail = normalizeEmail(req.body.email);
    if (!normalizedEmail) {
      res.status(400);
      throw new Error("Valid email is required");
    }
    const emailTaken = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (emailTaken) {
      res.status(400);
      throw new Error("Email is already in use by another account");
    }

    user.email = normalizedEmail;
  }

  if (req.body.address) {
    user.address = {
      ...user.address,
      ...req.body.address,
    };
  }

  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    user: mapUser(updatedUser),
    token: generateToken(updatedUser._id),
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 }).select("-password");
  res.json(users);
});

export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name ?? user.name;
  user.isAdmin = req.body.isAdmin ?? user.isAdmin;

  if (req.body.email !== undefined) {
    const normalizedEmail = normalizeEmail(req.body.email);
    if (!normalizedEmail) {
      res.status(400);
      throw new Error("Valid email is required");
    }
    const emailTaken = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (emailTaken) {
      res.status(400);
      throw new Error("Email is already in use by another account");
    }

    user.email = normalizedEmail;
  }

  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json(mapUser(updatedUser));
});

export const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isAdmin) {
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error("At least one admin must remain");
    }
  }

  await user.deleteOne();
  res.json({ message: "User removed" });
});
