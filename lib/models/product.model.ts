import mongoose, { InferSchemaType, Model } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    currency: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    priceHistory: {
      type: [
        {
          price: { type: Number, required: true },
          date: { type: Date },
        },
      ],
    },
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    discountRate: { type: Number },
    description: { type: String },
    category: { type: String },
    reviewsCount: { type: Number },
    isOutOfStock: { type: Boolean, default: false },
    users: {
      type: [
        {
          email: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export type IProduct = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId | string;
  id: string;
  __v: number;
};

export const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model("Product", productSchema);
