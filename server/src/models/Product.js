import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    brand: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    frameType: {
      type: String,
      enum: ["Full Rim", "Half Rim", "Rimless", "Cat Eye", "Aviator", "Wayfarer", "Round"],
      default: "Full Rim",
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex",
    },
    lensType: {
      type: String,
      enum: ["Single Vision", "Progressive", "Blue Light", "Polarized", "Zero Power"],
      default: "Single Vision",
    },
    material: { type: String, default: "Acetate" },
    color: { type: String, default: "Black" },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, default: 0 },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    specs: {
      size: { type: String, default: "Medium" },
      bridge: { type: String, default: "18mm" },
      temple: { type: String, default: "140mm" },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
