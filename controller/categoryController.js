import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

// create category
export const createCategoryController = async (req, res) => {
  try {
    const { categoryName } = req.body;
    //validation
    if (!categoryName) {
      return res.status(400).send({
        success: false,
        message: "Please provide category name",
      });
    }
    await categoryModel.create({ categoryName });
    res.status(201).send({
      success: true,
      message: `${categoryName} category created successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create category api",
    });
  }
};

// get category controller
export const getCategoryController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "categories fetched successfully",
      totalCat: categories.length,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get category api",
    });
  }
};

// update category
export const updateCategoryController = async (req, res) => {
  try {
    // find category
    const category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(400).send({
        success: false,
        message: "category not found",
      });
    }
    // get new category
    const { updateCategory } = req.body;

    // find product with this category id
    const products = await productModel.find({ category: category._id });
    // update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      products.categoryName = updateCategory;
      await product.save();
    }
    // update category
    category.categoryName = updateCategory;
    await category.save();
    res.status(200).send({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update category api",
    });
  }
};

// delete category
export const deleteCategoryController = async (req, res) => {
  try {
    // find category
    const category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(400).send({
        success: false,
        message: ` category not found`,
      });
    }
    // find product with this category id
    const products = await productModel.find({ category: category._id });
    // update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }
    // delete category
    await category.deleteOne();
    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error in delete category api",
    });
  }
};
