import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const makeSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const query = {};

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { brand: { $regex: req.query.search, $options: "i" } },
      { color: { $regex: req.query.search, $options: "i" } },
    ];
  }

  if (req.query.category) {
    if (mongoose.isValidObjectId(req.query.category)) {
      query.category = req.query.category;
    } else {
      const categoryDoc = await Category.findOne({ slug: req.query.category }).select("_id");
      if (!categoryDoc) {
        return res.json({
          products: [],
          page,
          pages: 0,
          total: 0,
        });
      }
      query.category = categoryDoc._id;
    }
  }

  if (req.query.frameType) {
    query.frameType = req.query.frameType;
  }

  if (req.query.gender) {
    query.gender = req.query.gender;
  }

  if (req.query.featured === "true") {
    query.featured = true;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = Number(req.query.maxPrice);
    }
  }

  let sortBy = { createdAt: -1 };

  switch (req.query.sort) {
    case "price-asc":
      sortBy = { price: 1 };
      break;
    case "price-desc":
      sortBy = { price: -1 };
      break;
    case "rating-desc":
      sortBy = { rating: -1 };
      break;
    case "newest":
      sortBy = { createdAt: -1 };
      break;
    default:
      break;
  }

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    salePrice,
    brand,
    category,
    frameType,
    gender,
    lensType,
    material,
    color,
    images,
    stock,
    featured,
    specs,
  } = req.body;

  if (!title || !description || !price || !brand || !category) {
    res.status(400);
    throw new Error("Required fields: title, description, price, brand, category");
  }

  const parsedPrice = Number(price);
  const parsedSalePrice =
    salePrice === undefined || salePrice === null || salePrice === "" ? null : Number(salePrice);
  const parsedStock = Number(stock ?? 0);

  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    res.status(400);
    throw new Error("Price must be a positive number");
  }

  if (parsedSalePrice !== null) {
    if (!Number.isFinite(parsedSalePrice) || parsedSalePrice <= 0) {
      res.status(400);
      throw new Error("Sale price must be a positive number");
    }
    if (parsedSalePrice > parsedPrice) {
      res.status(400);
      throw new Error("Sale price cannot be greater than price");
    }
  }

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    res.status(400);
    throw new Error("Stock must be a non-negative integer");
  }

  const categoryExists = await Category.findById(category).select("_id");
  if (!categoryExists) {
    res.status(400);
    throw new Error("Invalid category selected");
  }

  const normalizedImages =
    images && Array.isArray(images)
      ? images.map((image) => String(image || "").trim()).filter(Boolean)
      : [];

  const slugBase = makeSlug(title);
  const slug = `${slugBase}-${Date.now()}`;

  const product = await Product.create({
    title,
    slug,
    description,
    price: parsedPrice,
    salePrice: parsedSalePrice,
    brand,
    category,
    frameType: frameType || "Full Rim",
    gender: gender || "Unisex",
    lensType: lensType || "Single Vision",
    material: material || "Acetate",
    color: color || "Black",
    images:
      normalizedImages.length
        ? normalizedImages
        : [
            "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1000&q=80",
          ],
    stock: parsedStock,
    featured: Boolean(featured),
    specs: specs || {},
  });

  const populated = await product.populate("category", "name slug");
  res.status(201).json(populated);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (req.body.title) {
    product.title = req.body.title;
    product.slug = makeSlug(`${req.body.title}-${product._id}`);
  }

  if (req.body.description !== undefined) {
    product.description = req.body.description;
  }

  if (req.body.price !== undefined) {
    const parsedPrice = Number(req.body.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      res.status(400);
      throw new Error("Price must be a positive number");
    }
    product.price = parsedPrice;
  }

  if (req.body.salePrice !== undefined) {
    if (req.body.salePrice === null || req.body.salePrice === "") {
      product.salePrice = null;
    } else {
      const parsedSalePrice = Number(req.body.salePrice);
      if (!Number.isFinite(parsedSalePrice) || parsedSalePrice <= 0) {
        res.status(400);
        throw new Error("Sale price must be a positive number");
      }
      product.salePrice = parsedSalePrice;
    }
  }

  if (product.salePrice !== null && product.salePrice > product.price) {
    res.status(400);
    throw new Error("Sale price cannot be greater than price");
  }

  if (req.body.brand !== undefined) {
    product.brand = req.body.brand;
  }

  if (req.body.category !== undefined) {
    const categoryExists = await Category.findById(req.body.category).select("_id");
    if (!categoryExists) {
      res.status(400);
      throw new Error("Invalid category selected");
    }
    product.category = req.body.category;
  }

  if (req.body.frameType !== undefined) {
    product.frameType = req.body.frameType;
  }

  if (req.body.gender !== undefined) {
    product.gender = req.body.gender;
  }

  if (req.body.lensType !== undefined) {
    product.lensType = req.body.lensType;
  }

  if (req.body.material !== undefined) {
    product.material = req.body.material;
  }

  if (req.body.color !== undefined) {
    product.color = req.body.color;
  }

  if (req.body.images !== undefined) {
    if (!Array.isArray(req.body.images)) {
      res.status(400);
      throw new Error("Images must be an array");
    }

    const normalizedImages = req.body.images
      .map((image) => String(image || "").trim())
      .filter(Boolean);
    if (!normalizedImages.length) {
      res.status(400);
      throw new Error("At least one product image is required");
    }
    product.images = normalizedImages;
  }

  if (req.body.stock !== undefined) {
    const parsedStock = Number(req.body.stock);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      res.status(400);
      throw new Error("Stock must be a non-negative integer");
    }
    product.stock = parsedStock;
  }

  if (req.body.featured !== undefined) {
    product.featured = Boolean(req.body.featured);
  }

  if (req.body.specs !== undefined) {
    product.specs = req.body.specs;
  }

  const updated = await product.save();
  const populated = await updated.populate("category", "name slug");
  res.json(populated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ message: "Product removed" });
});
