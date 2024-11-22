"use server";

import { revalidatePath } from "next/cache";
import { Product } from "../models/product.model";
import { connectToDB } from "../mongoose";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { scrapeAmazonProduct } from "./scraper";

export const scrapeAndStoreProduct = async (productUrl: string) => {
  if (!productUrl) return;
  try {
    connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({
      url: scrapedProduct.url,
    }).lean();

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice, date: Date.now() },
      ];
      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    ).lean();

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error("Failed to create/update product: " + error.message);
  }
};

export const getProductById = async (id: string) => {
  try {
    connectToDB();

    const product = await Product.findById(id).lean();

    if (!product) return null;

    return { ...product, _id: product._id.toString() };
  } catch (error) {
    console.log(error);
  }
};

export const getAllProducts = async () => {
  try {
    connectToDB();

    const products = await Product.find().lean().select("-priceHistory._id");

    const data = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }));
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getSimilarProducts = async (id: string) => {
  try {
    connectToDB();

    const currentProduct = await Product.findById(id).lean();

    if (!currentProduct) return null;

    const similarProducts = await Product.find({ _id: { $ne: id } })
      .limit(3)
      .select("-priceHistory._id")
      .lean();

    const data = similarProducts.map((product) => {
      return { ...product, _id: product._id.toString() };
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const addUserEmailToProduct = async (id: string, email: string) => {
  try {
    const product = await Product.findById(id).lean();

    if (!product) return;

    const userExists = product.users.some((user) => user.email === email);

    if (!userExists) {
      const updatedProduct = await Product.findByIdAndUpdate(id, {
        $push: { users: { email } },
      }).lean();

      if (!updatedProduct) return;

      const emailContent = await generateEmailBody(updatedProduct, "WELCOME");

      await sendEmail(emailContent, [email]);
    }
  } catch (error) {
    console.log(error);
  }
};
