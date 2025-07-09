import express from "express";

import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  paymentController,
  createOrderController,
  getMyOrdersController,
  singleOrderController,
  getAllOrdersController,
  changeOrderStatusController,
} from "../controller/orderController.js";

const router = express.Router();

// ################## ORDER ROUTES ##################

// create order
router.post("/create", isAuth, createOrderController);

// get all orders
router.get("/my-orders", isAuth, getMyOrdersController);

// get single orders
router.get("/my-orders/:id", isAuth, singleOrderController);

// accept payment
router.post("/payments", isAuth, paymentController);

// ################ ADMIN PART #############

// getting all orders
router.get("/admin/get-all-orders", isAuth, isAdmin, getAllOrdersController);

// change order status
router.put("/admin/order/:id", isAuth, isAdmin, changeOrderStatusController);

export default router;
