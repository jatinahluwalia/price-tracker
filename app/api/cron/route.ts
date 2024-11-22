import { scrapeAmazonProduct } from "@/lib/actions/scraper";
import { Product } from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async () => {
  try {
    connectToDB();

    const products = await Product.find().lean();

    if (!products.length) throw new Error("No products found");

    const promises = products.map(async (product) => {
      const scrapedProduct = await scrapeAmazonProduct(product.url);

      if (!scrapedProduct) throw new Error("No product found");

      const updatedPriceHistory = [
        ...product.priceHistory,
        { price: scrapedProduct.currentPrice, date: new Date() },
      ];

      const newProduct = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
      };

      const updatedProduct = await Product.findOneAndUpdate(
        { url: product.url },
        newProduct
      ).lean();

      const emailNotifType = getEmailNotifType(scrapedProduct, product);

      console.log({
        emailNotifType,
        users: updatedProduct?.users,
        scrapedProduct,
      });

      if (emailNotifType && updatedProduct?.users.length) {
        console.log("E");
        const productInfo = {
          title: updatedProduct.title,
          url: updatedProduct.url,
          image: updatedProduct.image,
        };

        const emailContent = await generateEmailBody(
          productInfo,
          emailNotifType
        );

        const userEmails = updatedProduct.users.map((user) => user.email);

        await sendEmail(emailContent, userEmails);
      }
      return updatedProduct;
    });

    const updatedProducts = await Promise.all(promises);

    return NextResponse.json({ message: "OK", data: updatedProducts });
  } catch (error: any) {
    throw new Error(`Error in GET: ${error.message}`);
  }
};
