import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { stripe } from "../server.js";

// create order controller
export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;
    //validation
    if (
      !shippingInfo ||
      !orderItems ||
      !paymentMethod ||
      //   !paymentInfo ||
      !itemPrice ||
      !tax ||
      !shippingCharges ||
      !totalAmount
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }
    // create order
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });
    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      //find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }
    res.status(201).send({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create order api",
      error,
    });
  }
};

// get all orders : My Orders
export const getMyOrdersController = async (req, res) => {
  try {
    // find orders
    const orders = await orderModel.find({ user: req.user._id });
    // validation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "order not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "your order data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error in my order api",
        error,
      });
  }
};

// get single order
export const singleOrderController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);
    // validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "No order found",
      });
    }
    res.status(200).send({
      success: true,
      message: "your order fetched",
      order,
    });
  } catch (error) {
    console.log(error);
    // cast error || OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in get single order api",
      error,
    });
  }
};

//  payment controller
export const paymentController = async (req, res) => {
  try {
    // get amount from the user
    const { totalAmount } = req.body;
    // validation
    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "Total amount is required",
      });
    }
    const { client_server } = await stripe.paymentIntents.create({
      amount: Number(totalAmount) * 100, // INR amount in paise (1 INR = 100 paise)
      currency: "inr",
    });
    res.status(200).send({
      success: true,
      message: "Payment success",
      client_server,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in payment api",
    });
  }
};

// ################## ADMIN SECTION ###################

// GET ALL ORDERS
export const getAllOrdersController = async (req, res) => {
  try {
    // find orders
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "All orders data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all order api",
      error,
    });
  }
};

// change order status
export const changeOrderStatusController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);
    // validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }
    if (order.orderStatus === "processing") order.orderStatus = "shipped";
    else if (order.orderStatus === "shipped") {
      order.orderStatus = "delivered";
      order.deliveredAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "Order already delivered",
      });
    }
    await order.save();
    res.status(200).send({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in change order api",
    });
    error;
  }
};
