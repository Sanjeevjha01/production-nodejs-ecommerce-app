import productModel from "../models/productModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";

// get all product
export const getAllProductController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        category: category ? category : undefined,
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "all products fetched successfully",
      totalProduct: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all products api",
      error,
    });
  }
};

// get top product controller
export const getTopProductController = async (req, res) => {
  try {
    // to display top 3 products
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
    res.status(200).send({
      success: true,
      message: "Top 3 products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get top products api",
      error,
    });
  }
};

//get single product
export const getSingleProductController = async (req, res) => {
  try {
    // get product id
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Product found",
      product,
    });
  } catch (error) {
    console.log(error);
    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid API",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in get single product api",
      error,
    });
  }
};

//create product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    //validation
    // if (!name || !description || !price || !stock) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Please provide all fields",
    //   });
    // }
    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "Please provide product image",
      });
    }
    const file = getDataUri(req.file);
    const cloudDb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cloudDb.public_id,
      url: cloudDb.secure_url,
    };
    await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      images: [image],
    });
    res.status(201).send({
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create product api",
      error,
    });
  }
};

// update product controller
export const updateProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const { name, description, price, stock, category } = req.body;
    // validate and update
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    res.status(200).send({
      success: true,
      message: "Product details updated",
    });
  } catch (error) {
    console.log(error);
    // cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in update product api",
      error,
    });
  }
};

// update product image controller
export const updateProductImageController = async (req, res) => {
  try {
    //find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const file = getDataUri(req.file);
    const cloudDb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cloudDb.public_id,
      url: cloudDb.secure_url,
    };
    // save
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product image updated",
    });
  } catch (error) {
    console.log(error);
    // cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in update product image api",
      error,
    });
  }
};

// delete product image controller
export const deleteProductImageController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    //find image id
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // getting index
    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image not found",
      });
    }

    // delete product image
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product image deleted successfully",
    });
  } catch (error) {
    console.log(error);
    // cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in delete product image api",
      error,
    });
  }
};

// delete product
export const deleteProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // find and delete image from cloudinary by index
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    // cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in delete product image api",
      error,
    });
  }
};

// CREATE PRODUCT REVIEW AND COMMENT
export const reviewProductController = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    // find product
    const product = await productModel.findById(req.params.id);
    // check prevv review
    const alreadyReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReview) {
      return res.status(400).send({
        success: false,
        message: "Product already reviewed",
      });
    }
    // review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    // passing review object to reviews array
    product.reviews.push(review);
    // number of reviews
    product.numReviews = product.reviews.length;
    // it will calculate overall product rating bassed on all users rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;
    // save
    await product.save();
    res.status(200).send({
      success: true,
      message: "Review added",
    });
  } catch (error) {
    console.log(error);
    // cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in review comment api",
      error,
    });
  }
};
