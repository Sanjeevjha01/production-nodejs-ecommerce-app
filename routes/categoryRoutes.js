import express from "express";

import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryController,
  updateCategoryController,
} from "../controller/categoryController.js";

const router = express.Router();

// category routes

// create category
router.post("/create", isAuth, isAdmin, createCategoryController);

// get all category
router.get("/get-all", isAuth, getCategoryController);

// update category
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

// delete category
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);

export default router;
