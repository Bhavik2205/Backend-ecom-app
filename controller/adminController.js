const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const jwt = require("jsonwebtoken");
const categoryModel = require("../models/categoryModel");
const subcategoryModel = require("../models/subcategoryModel");
const common = require("../config/common");
const orderModel = require("../models/orderModel");
const orderDetailModel = require("../models/orderdetailModel");
const reelModel = require("../models/reelModel");
const likeModel = require("../models/likeModel");
const commentModel = require("../models/commentModel");
const couponModel = require("../models/couponModel");
const followModel = require("../models/followModel");
const streamModel = require("../models/streamModel");
const handlebars = require("handlebars");
const transporter = require("../helpers/nodemail");
const axios = require('axios');
const APIService = require("../100msSDK/APIService");
const TokenService = require("../100msSDK/TokenService");
const roomUserMap = require("../models/roomModel");
const shiprocketModel = require("../models/shiprocketModel");
const XLSX = require('xlsx');
const notificationModel = require("../models/notificationModel");
const { log } = require("console");

module.exports = {
  createAndUpdateUser: async function (req, res) {
      try {
        if (req.body._id) {
          const user = await userModel.findOneAndUpdate(
            { _id: req.body._id },
            req.body
          );
          res
            .status(200)
            .json({ status: "ok", msg: `User updated Successfully` });
        } else {

          if(req.body.username && req.body.email && req.body.name){
            const tokenService = new TokenService();
            const apiService = new APIService(tokenService);
            const user = await userModel.create(req.body);
              const payload = {
                name: user._id,
                description: user.name,
                template_id: "646451e3cf40249d65f273e3" //change this with actual live template id
              }
             const roomData = await apiService.post(`/rooms`, payload)
             if(roomData){
              await userModel.findOneAndUpdate(user._id, {roomId: roomData.id});
              res.status(201).json({ status: "ok", msg: "User Registerd Success" });
             }
          }
          else{
            res
            .status(200)
            .json({ status: "error", msg: `Username, email and name are required` });
          }

       
        }
      } catch (err) {
        res.status(400).json({ err });
      }
  },
  createAndLoginSocialUser: async function (req, res) {
    try {
      if (req.body.authId) {
        const user = await userModel.findOne({ authId: req.body.authId });
        if(!user){
          
          const tokenService = new TokenService();
          const apiService = new APIService(tokenService);
          const user = await userModel.create(req.body);
          const token = jwt.sign({ userId: user._id }, "jwtkey");
          let body = {
            token: token,
          };
          const userup = await userModel.findOneAndUpdate(
            { _id: user._id },
            body,
            { new: true }
          );
            const payload = {
              name: user._id,
              description: user.name,
              template_id: "646451e3cf40249d65f273e3" //change this with actual live template id
            }
           const roomData = await apiService.post(`/rooms`, payload)
           if(roomData){
           const u =  await userModel.findOneAndUpdate(user._id, {roomId: roomData.id}, { new: true });
            res.status(201).json({ user:u,status: "ok", msg: "User Registerd and login Success" });
           }
        }
        else{
          const token = jwt.sign({ userId: user._id }, "jwtkey");
          let body = {
            token: token,
          };
          const userup = await userModel.findOneAndUpdate(
            { _id: user._id },
            body,
            { new: true }
          );
          res.status(200).json({user: user, status: "ok",msg:"login Success"})
        }
      }
      else{
        res.status(200).json({ status: "error",msg:"provide data for login"})
      }
    } catch (err) {
      res.status(400).json({ err });
    }
},
  checkUserName: async function (req, res) {
    try {
      if (req.body.username) {
        const user = await userModel.countDocuments({
          username: req.body.username,
        });
        if (user > 0) {
          res
            .status(200)
            .json({ status: "error", msg: `Username already exist` });
        } else {
          res.status(200).json({ status: "ok", msg: `Username is unique` });
        }
      } else {
        res.status(200).json({ status: "error", msg: `Enter Username` });
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  sendOtp: async function (req, res) {
    try {
      let otp = Math.floor(1000 + Math.random() * 9000);

      const filePath = path.join(__dirname, "/emailTemplate/otpEmail.html");
      const source = fs.readFileSync(filePath, "utf-8").toString();
      const template = handlebars.compile(source);
      const replacements = {
        otp: otp,
      };
      const htmlToSend = template(replacements);

      mailOptions = {
        from: "ayushr418@gmail.com",
        to: req.body.email,
        subject: "OTP",
        // text: body,
        replyTo: "ayushr418@gmail.com",
        html: htmlToSend,
      };
      transporter.sendMail(mailOptions, async (err, result) => {
        if (err) {
          res.status(400).json("Opps error occured");
        } else {
          res
            .status(200)
            .json({
              status: "ok",
              msg: "Otp Has been Sent to Your Mail.",
              otp,
            });
        }
      });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  loginUser: async function (req, res) {
    try {
      let check = await userModel.countDocuments({ email: req.body.email });

      if (check > 0) {
        let user = await userModel.findOne({
          email: req.body.email,
          password: req.body.password,
        });
        // Generate a JWT token
        if (user) {
          const token = jwt.sign({ userId: user._id }, "jwtkey");
          let body = {
            token: token,
          };
          const userup = await userModel.findOneAndUpdate(
            { _id: user._id },
            body,
            { new: true }
          );
          res
            .status(200)
            .json({ status: "ok", msg: "Login successfully", user: userup });
        } else {
          res
            .status(200)
            .json({ status: "error", msg: "Invalid Email or password" });
        }
      } else {
        res.status(200).json({ status: "error", msg: "User Not Found" });
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  logOutUser: async function (req, res) {
    try {
      const userup = await userModel.findOneAndUpdate(
        { _id: req.body._id },
        { token: "" }
      );
      res.status(200).json({ status: "ok", msg: "Logout successfully" });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  dashboardLogin: async function (req, res) {
    try {
      const userup = await userModel.findOne({
        email: req.body.email,
        password: req.body.password,
      });

      if(userup){
        res.status(200).json({ user:userup, status: "ok", msg: "Login successfully" });
      }
      else{
        res.status(200).json({status: "error", msg: "No User found"});
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  addToCart: async function (req, res) {
    try {
      let cartItem = await cartModel.findOne({ user: req.body.user });
      let newCart = {};
      if (cartItem) {
        // If the product exists, update the cart
        let index = cartItem.products.findIndex(
          (e) => e.product == req.body.productId
        );
        if (index >= 0) {
          if (cartItem.products[index].product == req.body.productId && common.isObjectInArray(cartItem.products[index].combination,req.body.combination))
          {
            cartItem.products[index].quantity += req.body.quantity;
            cartItem.products[index].price += req.body.price;
          } else {
            let obj = {
              productName: req.body.productName,
              product: req.body.productId,
              vendor: req.body.vendor,
              quantity: req.body.quantity,
              price: req.body.price,
              combination:req.body.combination
            };
            cartItem.products.push(obj);
          }

          let cart = await cartModel
            .findByIdAndUpdate({ _id: cartItem._id }, cartItem, { new: true })
            .populate("user");
          res.status(200).json(cart);
        }
      } else {
        // If the product does not exist, create a new cart item
        newCart = {
          user: req.body.user,
          products: [
            {
              product: req.body.productId,
              vendor: req.body.vendor,
              productName: req.body.productName,
              quantity: req.body.quantity,
              combination:req.body.combination,
              price: req.body.price,
            },
          ],
        };

        await cartModel.create(newCart);
        let cart = await cartModel
          .findOne({ user: req.body.user })
          .populate("user");
        res.status(200).json(cart);
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  createAndUpdateProduct: async function (req, res) {
    {
      try {
        if (req.body._id) {
          const user = await productModel.findOneAndUpdate(
            { _id: req.body._id },
            req.body
          );
          res
            .status(200)
            .json({ status: "ok", msg: `Product updated Successfully` });
        } else {
          const user = await productModel.create(req.body);
          res
            .status(201)
            .json({ status: "ok", msg: "Product Inserted Success" });
        }
      } catch (err) {
        res.status(400).json({ err });
      }
    }
  },
  getProductByVendor: async function (req, res) {
    try {
      const product = await productModel
        .find({ isActive: true, vendorId: req.body.vendor })
        .populate("vendorId")
        .populate("categoryId")
        .populate("subcategoryId");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
       const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      let productArray = []
      productArray  = JSON.parse(JSON.stringify(product))
      for (let pro of productArray) {
        pro.todaySales = await orderDetailModel.countDocuments({ productId: pro._id, created: today });
        pro.lastWeekSales = await orderDetailModel.countDocuments({ productId: pro._id, created: { $gte: lastWeek, $lte: today } });
        pro.lastMonthSales = await orderDetailModel.countDocuments({ productId: pro._id, created: { $gte: lastMonth, $lte: today } });
       
      }
      res.status(200).json({ data: productArray});
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  createAndUpdateCat: async function (req, res) {
    {
      try {
        if (req.body._id) {
          const cat = await categoryModel.findOneAndUpdate(
            { _id: req.body._id },
            req.body
          );
          res
            .status(200)
            .json({ status: "ok", msg: `Category updated Successfully` });
        } else {
          const cat = await categoryModel.create(req.body);
          res
            .status(201)
            .json({ status: "ok", msg: "Category Registerd Success" });
        }
      } catch (err) {
        res.status(400).json({ err });
      }
    }
  },
  createAndUpdateSubCat: async function (req, res) {
    {
      try {
        if (req.body._id) {
          const subcat = await subcategoryModel.findOneAndUpdate(
            { _id: req.body._id },
            req.body
          );
          res
            .status(200)
            .json({ status: "ok", msg: `Subcategory updated Successfully` });
        } else {
          const subcat = await subcategoryModel.create(req.body);
          res
            .status(201)
            .json({ status: "ok", msg: "Subcategory Registerd Success" });
        }
      } catch (err) {
        res.status(400).json({ err });
      }
    }
  },
  getCartByUser: async function (req, res) {
    try {
      const cart = await cartModel
        .find({ user: req.body.user })
        .populate("user")

      res.status(200).json({ data: cart });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  createOrder: async function (req, res) {
    try {
      let cart = await cartModel.findOne({ _id: req.body.cartId });
      // console.log(cart);
      let random = common.generateRandomNumber();
      let ordrId = `LY-${random}`;

      let order = {
        orderId: ordrId,
        userId: cart.user,
        name: req.body.name,
        address: req.body.address,
        pincode: req.body.pincode,
        paymentStatus: req.body.paymentStatus,
      };
      await orderModel.create(order);
      let orderDetail = {};
      for (const ord of cart.products) {
        orderDetail.orderId = ordrId;
        orderDetail.vendorId = ord.vendor;
        orderDetail.productName = ord.productName;
        orderDetail.price = ord.price;
        orderDetail.quantity = ord.quantity;
        orderDetail.combination = ord.combination;
        await orderDetailModel.create(orderDetail);
        orderDetail = {};
      }

      res
        .status(200)
        .json({
          status: "ok",
          orderId: ordrId,
          message: "Order Created Success",
        });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  createOrderV2: async function (req, res) {
    try {
      // let cart = await cartModel.findOne({ _id: req.body.cartId });
      // console.log(cart);
      let random = common.generateRandomNumber();
      let ordrId = `LY-${random}`;

      let order = {
        orderId: ordrId,
        userId: req.body.userId,
        name: req.body.name,
        address: req.body.address,
        pincode: req.body.pincode,
        paymentStatus: req.body.paymentStatus,
        transaction:req.body.transaction,
        mobile: req.body.mobile,
        locality: req.body.locality,
        city: req.body.city,
        state: req.body.state,
        addressName: req.body.addressName,
      };
      await orderModel.create(order);
      let orderDetail = {};
      // for (const ord of cart.products) {
        orderDetail.orderId = ordrId;
        orderDetail.vendorId = req.body.vendorId;
        orderDetail.productId = req.body.productId;
        orderDetail.productName = req.body.productName;
        orderDetail.quantity = req.body.quantity;
        orderDetail.combination = req.body.combination;
        await orderDetailModel.create(orderDetail);
        // orderDetail = {};
      // }

      res
        .status(200)
        .json({
          status: "ok",
          orderId: ordrId,
          message: "Order Created Success",
        });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getUserById: async function (req, res) {
    try {
      const { id: userId } = req.params;

      const user = await userModel.findOne({ _id: userId });

      if (!user) {
        return res.status(200).json({ msg: `No User with Id ${userId}` });
      }
      res.status(200).json({ user: user });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },
  getAllNormalUser: async function (req, res) {
    try {
      const user = await userModel.find({ userType: "User" });

      res.status(200).json({ data: user });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getAllCreatorUser: async function (req, res) {
    try {
      const user = await userModel.find({ userType: "Creator" });

      res.status(200).json({ data: user });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getAllBusinessUser: async function (req, res) {
    try {
      const user = await userModel.find({ userType: "BUSINESS" });

      res.status(200).json({ data: user });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getOrderByOrderId: async function (req, res) {
    try {
      const order = await orderModel.aggregate([
        {
          $match: {
            orderId: req.body.orderId,
          },
        },
        {
          $lookup: {
            from: "orderdetails",
            localField: "orderId",
            foreignField: "orderId",
            as: "details",
          },
        },
      ]);

      // const order = await orderModel.find({orderId:req.body.orderId});
      res.status(200).json({ data: order });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  createAndUpdateOrder: async function (req, res) {
    {
      try {
        if (req.body._id) {
          const coupon = await orderModel.findOneAndUpdate(
            { _id: req.body._id },
            req.body
          );
          res
            .status(200)
            .json({ status: "ok", msg: `Order updated Successfully` });
        } else {
          const coupon = await orderModel.create(req.body);
          res
            .status(201)
            .json({ status: "ok", msg: "Order Registerd Success" });
        }
      } catch (err) {
        res.status(400).json({ err });
      }
    }
  },
  createAndUpdateCoupon: async function (req, res) {
    {
      try {
        if (req.body._id) {
          const coupon = await couponModel.findOneAndUpdate(
            { _id: req.body._id },
            req.body
          );
          res
            .status(200)
            .json({ status: "ok", msg: `Coupon updated Successfully` });
        } else {
          const coupon = await couponModel.create(req.body);
          res
            .status(201)
            .json({ status: "ok", msg: "Coupon Registerd Success" });
        }
      } catch (err) {
        res.status(400).json({ err });
      }
    }
  },
  getCouponByVendor: async function (req, res) {
    try {
      const coupon = await couponModel
        .find({ vendorId: req.body.vendorId })
        .populate("vendorId");

      res.status(200).json({ data: coupon });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  updatePassword: async function (req, res) {
    try {
      const user = await userModel.findOne({ _id: req.body._id });

      if (user) {
        if (user.password == req.body.oldPass) {
          const upUser = await userModel.findOneAndUpdate(
            { _id: req.body._id },
            { password: req.body.newPass }
          );
          res
            .status(200)
            .json({ status: "ok", msg: "Password Updated Success" });
        } else {
          res
            .status(200)
            .json({ status: "error", msg: "Old Password Does not Matched" });
        }
      } else {
        res.status(200).json({ status: "error", msg: "User Not Found" });
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },

  recoverPassword: async function (req, res) {
    const { username } = req.body;
    try {
      if (username) {
        if (username.trim() === "")
          throw new Error("Invalid recipent Username");
      } else throw new Error("Invalid receipt Username");

      const user = await userModel.findOne({ username: username });

      if (user) {
        const filePath = path.join(__dirname, "/emailTemplate/testEmail.html");
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handlebars.compile(source);
        const replacements = {
          username: user.username,
          password: user.password,
        };
        const htmlToSend = template(replacements);

        mailOptions = {
          from: "ayushr418@gmail.com",
          to: user.email,
          subject: "password Recovery",
          // text: body,
          replyTo: "ayushr418@gmail.com",
          html: htmlToSend,
        };
        transporter.sendMail(mailOptions, async (err, result) => {
          if (err) {
            res.status(400).json("Opps error occured");
          } else {
            res
              .status(200)
              .json({
                status: "ok",
                msg: "Password Has been Sent to Your Mail.",
              });
          }
        });
      } else {
        res.status(200).json({ status: "error", msg: "User Not Found" });
      }
    } catch (error) {
      res.status(400).json(error.message);
    }
  },
  getAllUser: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      
      const totalUser = await userModel.countDocuments({isActive:true});
      if(totalUser>0){
          const user = await userModel.find({isActive:true}).sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:user,total:totalUser});
      }else{
          res.status(200).json({data:[],total:totalUser}); 
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getAllUserByType: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      let filter = {};
      filter = common.queryModifier(req.body.filter);
       const totalUser = await userModel.countDocuments(filter);
       if(totalUser>0){
           const user = await userModel.find(filter).sort(sort).skip(query.skip).limit(query.limit);
           res.status(200).json({data:user,total:totalUser});
       }else{
           res.status(200).json({data:[],total:totalUser}); 
       }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getAllProduct: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      let filter = {};
      filter = common.queryModifier(req.body.filter);

      const totalUser = await productModel.countDocuments(filter);
      if(totalUser>0){
          const user = await productModel.find(filter).populate("vendorId").populate("categoryId").sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:user,total:totalUser});  
      }else{
          res.status(200).json({data:[],total:totalUser}); 
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getProductByIdWeb: async function (req, res) {
    try {
      const { id: userId } = req.params;

      const user = await productModel.findOne({ _id: userId });

      if (!user) {
        return res.status(200).json({ msg: `No Product with Id ${userId}` });
      }
      res.status(200).json({ data: user });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },
  getAllOrder: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      let filter = {};
      filter = common.queryModifier(req.body.filter);
      if(Object.keys(filter).length < 1){
        const totalOrders = await orderModel.countDocuments({});
        if(totalOrders>0){
          const order = await orderModel.aggregate([
            {
             $match:filter
            },
            {
              $sort: sort
            },
            {
              $skip: query.skip
            },
            {
              $limit: query.limit
            },
            {
              $lookup: {
                from: "orderdetails",
                localField: "orderId",
                foreignField: "orderId",
                as: "details",
              },
            },
          ]);
            res.status(200).json({data:order,total:totalOrders});  
        }else{
            res.status(200).json({data:[],total:totalOrders}); 
        }
      }
      else{
        const totalOrders = await orderDetailModel.countDocuments(filter);
        if(totalOrders>0){
          const order = await orderModel.aggregate([
            {
         $match:filter
            },
            {
              $sort: sort
            },
            {
              $skip: query.skip
            },
            {
              $limit: query.limit
            },
            {
              $lookup: {
                from: "user",
                localField: "vendorId",
                foreignField: "_id",
                as: "vendor",
              },
            },
          ]);
            res.status(200).json({data:order,total:totalOrders});  
        }else{
            res.status(200).json({data:[],total:totalOrders}); 
        }
      }

    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getOrderByStatus: async function (req, res) {
    try {
      const order = await orderModel.aggregate([
        {
          $match: {
            paymentStatus: req.body.status,
          },
        },
        {
          $lookup: {
            from: "orderdetails",
            localField: "orderId",
            foreignField: "orderId",
            as: "details",
          },
        },
      ]);

      // const order = await orderModel.find({orderId:req.body.orderId});
      res.status(200).json({ data: order });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  setlikeVideo: async function (req, res) {
    try {

      const checkLike = await likeModel.countDocuments({userId:req.body.userId,videoId:req.body.videoId});
      if(checkLike > 0){
        res.status(200).json({message:"Already liked the video"});
      }
      else{
        const like = await likeModel.create(req.body);
        res.status(200).json({ status: "ok" });
      }
    } catch (err) {
      res.status(400).json({ msg:"Internal Server Error" });
    }
  },
  getCategory: async function (req, res) {
    try {
      const cat = await categoryModel.find({});

      res.status(200).json({ data: cat });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getAllCategoryWithPagination: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      
      const totalCat = await categoryModel.countDocuments({isActive:true});
      if(totalCat>0){
          const user = await categoryModel.find({isActive:true}).sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:user,total:totalCat});
      }else{
          res.status(200).json({data:[],total:totalCat}); 
      }
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getSubCategoryByCat: async function (req, res) {
    try {
      const subcat = await subcategoryModel
        .find({ categoryId: req.body.categoryId })
        .populate("categoryId");

      res.status(200).json({ data: subcat });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  setCommentVideo: async function (req, res) {
    try {
      const comment = await commentModel.create(req.body);
      res.status(201).json({ status: "ok" });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  addFollower: async function (req, res) {
    try {
      const userToFollow = await userModel.findById(req.body.following);
      if (!userToFollow) {
        return res.status(200).json({ message: "User not found" });
      }
      const checkFollwer = await followModel.countDocuments({follower:req.body.follower,following:req.body.following});

      if(checkFollwer > 0){
        res.status(200).json({ status:"ok", message: "Already followed"});
      }
      else{
        const follow = await followModel.create(req.body);
        res.status(201).json({ status:"ok",message: "Followed successfully" })
      }
    } catch (err) {
      res.status(400).json({ msg:"Internal Server Error" });
    }
  },
  removeFollower: async function (req, res) {
    try {
      const userToFollow = await userModel.findById(req.body.following);
      if (!userToFollow) {
        return res.status(200).json({ message: "User not found" });
      }
      const follow = await followModel.findOneAndDelete({
        follower: req.body.follower,
        following: req.body.following
      });
      if (!follow) {
        return res.status(200).json({ message: 'You are not following this user' });
      }
      res.status(200).json({ status:"ok",message: "Unfollowed successfully" })
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getFollowerById: async function (req, res) {
    try {
        const followers = await followModel.find({ following: req.body.userId }).populate("follower").populate("following");
        const countFollow = await followModel.countDocuments({ following: req.body.userId })
        res.status(200).json({data:followers,count:countFollow});
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  },
  getFollowingById: async function (req, res) {
    try {
        const following = await followModel.find({ follower: req.body.userId }).populate("follower").populate("following");
        const countFollowing = await followModel.countDocuments({ follower: req.body.userId })
        res.status(200).json({data:following,count:countFollowing});
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  },
  getLikeByVideoId: async function (req, res) {
    try {
        const like = await likeModel.find({ videoId: req.body.videoId });
        const likeCount = await likeModel.countDocuments({ videoId: req.body.videoId,count:"+1" });
        const unlikeCount = await likeModel.countDocuments({ videoId: req.body.videoId, count:"-1"});
        res.status(200).json({data:like,count:Math.abs(likeCount - unlikeCount)});
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  },
  getCommentByVideoId: async function (req, res) {
    try {
        const comment = await commentModel.find({ videoId: req.body.videoId });
        const commentCount = await commentModel.countDocuments({ videoId: req.body.videoId }).populate("userId");
        res.status(200).json({data:comment,count:commentCount});
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  },
  searchBrands: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      const totalUser = await userModel.countDocuments({name: { $regex: req.body.search, $options: 'i' },userType:"BUSINESS",isActive:true});
      if(totalUser>0){
          const blog = await userModel.find({name: { $regex: req.body.search, $options: 'i' },userType:"BUSINESS",isActive:true}).sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:blog,total:totalUser});
      }else{
          res.status(200).json({data:[],total:totalUser}); 
      }

      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  },
  searchProduct: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      const totalProduct = await productModel.countDocuments({name: { $regex: req.body.search, $options: 'i' },vendorId:req.body.brandId,isActive:true});
      if(totalProduct>0){
          const product = await productModel.find({name: { $regex: req.body.search, $options: 'i' },isActive:true}).populate({path:"vendorId",select:"name"}).populate({path:"categoryId",select:"name"}).populate({path:"subcategoryId",select:"name"}).sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:product,total:totalProduct});
      }else{
          res.status(200).json({data:[],total:totalProduct}); 
      }
      
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  },
  getProductById: async function (req, res) {
    try {
      const { id: pId } = req.params;

      const pro = await productModel.findOne({ _id: pId }).populate({path:"vendorId",select:"name"}).populate({path:"categoryId",select:"name"}).populate({path:"subcategoryId",select:"name"});

      if (!pro) {
        return res.status(200).json({ msg: `No Product with Id ${pId}` });
      }
      res.status(200).json({ data: pro });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },
  goLiveWithProduct: async function (req, res) {
    try {
      if (req.body._id) {
        const stream = await streamModel.findOneAndUpdate(
          { _id: req.body._id },
          req.body
        );
        res
          .status(200)
          .json({ status: "ok", msg: `Data updated Successfully`});
      } else {
        const tokenService = new TokenService();
        const apiService = new APIService(tokenService);
        const room = await roomUserMap.findOne({userId: req.body.userId});
        if(room){
          const liveStreamBody = {
            meeting_url: `https://1test.app.100ms.live/preview/${room.roomId}/broadcaster`,
            recording: {
              hls_vod: true,
              single_file_per_layer: false
            }
          }
         const lroom =  await apiService.post(`/live-streams/room/${room.roomId}/start`, liveStreamBody)
            req.body.meetingUrl = liveStreamBody.meeting_url;
            req.body.hmsRoomId = lroom.id;
            const stream = await streamModel.create(req.body);
            res.status(201).json({ status: "ok", msg: "Data Inserted Success",hmsRoomId: stream.hmsRoomId,streamId:stream._id, isLive: stream.isLive, meetingUrl: stream.meetingUrl});
        }else if(!room){
          const payload = {
            name: req.body.userId,
            description: "creator",
            template_id: "646451e3cf40249d65f273e3" //change this with actual live template id
          }
          const roomData = await apiService.post(`/rooms`, payload)
           const rmp =  await roomUserMap.create({userId: req.body.userId, roomId: roomData.id})
              const liveStreamBody = {
                meeting_url: `https://1test.app.100ms.live/preview/${rmp.roomId}/broadcaster`,
                recording: {
                  hls_vod: true,
                  single_file_per_layer: false
                }
              }
              const lroom = await apiService.post(`/live-streams/room/${rmp.roomId}/start`, liveStreamBody)
                req.body.meetingUrl = liveStreamBody.meeting_url;
                req.body.hmsRoomId = lroom.id;
                const stream = await streamModel.create(req.body);
                res.status(201).json({ status: "ok", msg: "Data Inserted Success",hmsRoomId: stream.hmsRoomId,streamId:stream._id, isLive: stream.isLive, meetingUrl: stream.meetingUrl});
        }
      }
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },
  endLiveStream: async function(req, res) {
    try{
      
      if(!req.body.id){
        res.status(409).json({error: "Please enter the stream id"});
      }else{
  
         const streamg = await streamModel.findOne({hmsRoomId:req.body.id});
          const tokenService = new TokenService();
          const apiService = new APIService(tokenService);
    
          await apiService.post(`/live-streams/${streamg.hmsRoomId}/stop`);
            const stream = await streamModel.findOneAndUpdate(
              { _id: req.body.id },
              req.body
            );
            res
              .status(200)
              .json({ status: "ok", msg: `Live Stream ended successfully`});
      }

    }
    catch(err){
      res.status(500).json({ msg: err });
    }
  },
  sendNotification: async function (req, res) {
    // Set the device registration token and notification payload
const data = {
  to:"yy",
  notification: {
    title: 'Title of your notification',
    body: 'Body of your notification',
    icon: 'your-icon-url',
    click_action: 'your-action-url'
  }
};

// Set the headers for the API request
const headers = {
  'Authorization': 'key=AAAATq5UIoI:APA91bFRq4HDSvl2EScRLSe_GuLVEV_Ay2BP1N2ibZcqNmUyYtjONnFi4ScSAuPWthRapG-eAnZ3Ijz2gtHCkOQWg2HfLDnl8Z47h5a7kwGjsotNuPZlb3VKEJK-a_Q_ZdFJbEHnnpTo', //server key firebase
  'Content-Type': 'application/json'
};

// Send the notification using Axios
axios.post('https://fcm.googleapis.com/fcm/send', data, { headers })
  .then(async (response) => {
    await notificationModel.create(data);
    res.status(200).json({msg:"Successfully sent message",data:response.data});
  })
  .catch((error) => {
    res.status(200).json({msg:"Error sending message",data:error.response.data});
  });
    
  },
  checkShippingPincode:async function(req, res){
   const getShipToken = await shiprocketModel.countDocuments({});

   if(getShipToken > 1){
    //date expire check
   }
   else{
    
   }
  const pincode = '110001'; // Replace with the pincode you want to check

axios.get(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=110001&delivery_postcode=${pincode}`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.log(error);
});
  },
  checkProductPrice:async function(req,res){
    const apiKey = 'your_api_key';
const weight = 1; // Replace with the weight of your shipment in kg
const length = 10; // Replace with the length of your shipment in cm
const breadth = 20; // Replace with the breadth of your shipment in cm
const height = 30; // Replace with the height of your shipment in cm
const cod = false; // Set to true if you want to enable cash on delivery

axios.post('https://apiv2.shiprocket.in/v1/external/courier/charges/', {
    weight: weight,
    length: length,
    breadth: breadth,
    height: height,
    cod: cod
}, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.log(error);
});
  },

  getDashboardCount:async function(req,res){
    const activeUser = await userModel.countDocuments({isActive: true,userType:"USER"});
    const activeCreator = await userModel.countDocuments({isActive: true,userType:"CREATOR"});
    const activeVendor = await userModel.countDocuments({isActive: true,userType:"BUSINESS"});
    const totalOrder = await orderModel.countDocuments({});
    const totalCat = await categoryModel.countDocuments({isActive: true});

    const inactiveUser = await userModel.countDocuments({isActive: false});

    res.status(200).json({totalUser:activeUser,totalCreator:activeCreator,totalVendor:activeVendor,inactiveUser,totalOrder,totalCat});

  },
  getDashboardCountByBusiness:async function(req,res){
    const totalProduct = await productModel.countDocuments({isActive: true,vendorId:req.body.vendorId});
    const activeProduct = await productModel.countDocuments({isActive: true,vendorId:req.body.vendorId});
    const inactiveProduct = await productModel.countDocuments({isActive: false,vendorId:req.body.vendorId});
    const totalOrder = await orderModel.countDocuments({vendorId:req.body.vendorId});
    res.status(200).json({totalProduct,activeProduct,inactiveProduct,totalOrder});

  },

  getLiveSession:async function(req, res) {
    try{
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      const totalLive = await streamModel.countDocuments({type:'live',isLive:true});
      if(totalLive>0){
          const session = await streamModel.find({type:'live',isLive:true}).populate({path:"vendorId",select:"name"}).populate({path:"userId",select:"username"}).populate("productId").sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:session,total:totalLive});
      }else{
          res.status(200).json({data:[],total:totalLive}); 
      }
    }
    catch(error) {
      res.status(500).json({ msg: error });
    }

  },
  getScheduledSession:async function(req, res) {
    try{
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      const totalSchedule = await streamModel.countDocuments({type:'scheduled'});
      if(totalSchedule>0){
          const session = await streamModel.find({type:'scheduled'}).populate({path:"vendorId",select:"name"}).populate({path:"userId",select:"username"}).populate("productId").sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:session,total:totalSchedule});
      }else{
          res.status(200).json({data:[],total:totalSchedule}); 
      }
    }
    catch(error) {
      res.status(500).json({ msg: error });
    }

  },
  uploadProductExcel: async function (req, res) {
    try {
      if (req.body.file == undefined) {
        return res.status(400).json("Please upload an excel file!");
      }
      let path = __dirname + "/../public/images/" + req.body.file;
      const workbook = XLSX.readFile(path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const getCat = await categoryModel.findOne({_id:req.body.categoryId});
     
      let bulkData = []
      for (const dt of data) {
        dt.categoryId = req.body.categoryId;
        dt.vendorId = req.body.vendorId;
        dt.isActive = true;
        if(bulkData.length){
        let combinationProduct = bulkData.filter(pr=> pr.sku==dt.sku)
   
        if(bulkData.filter(pr=> pr.sku==dt.sku).length){
            for(let product of combinationProduct){
              if(!product.combination){
                product.combination = [{
                  value:getCat.attribute
                }]
              }
              product.combination.push({
                value:[dt.color,dt.size],
                price:dt.price,
                stock:dt.stock,
              })
            }
            // dt.combination =  product.combination
            // console.log( dt.combination,'find the bluk data');
            // for(let comP of bulkData){
            //   comP.combination = dt.combination
            // }
            // bulkData.push(dt)
          }else{
            if(!dt.combination){
              dt.combination = [{
                value:getCat.attribute
              }]
            }

            dt.combination.push({
              value:[dt.color,dt.size],
              price:dt.price,
              stock:dt.stock,
            });
            bulkData.push(dt)
          }

        }else{       
            if(!dt.combination){
              dt.combination = [{
                value:getCat.attribute
              }]
            }
            dt.combination.push({
              value:[dt.color,dt.size],
              price:dt.price,
              stock:dt.stock,
            })
            bulkData.push(dt)
            
       
        }
       
      }
      // console.log(bulkData);
      // res.json(bulkData)
      // return
      try {
        const appBulk = await productModel.insertMany(bulkData);
        res.status(200).json({ status: "ok", msg: `Uploaded Successfully` });
      } catch (err) {
        res.status(400).json(err);
      }
    } catch (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred.",
      });
    }
  },
  getCategoryById: async function (req, res) {
    try {
      const { id: pId } = req.params;

      const pro = await categoryModel.findOne({ _id: pId })

      if (!pro) {
        return res.status(200).json({ msg: `No Category with Id ${pId}` });
      }
      res.status(200).json({ data: pro });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  },
  getOrderByVendor: async function (req, res) {
    try {
      const order = await orderDetailModel.aggregate([
        {
          $match: {
            vendorId: req.body.vendor,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendor",
          },
        },
      ]);

      // const order = await orderModel.find({orderId:req.body.orderId});
      res.status(200).json({ data: order });
    } catch (err) {
      res.status(400).json({ err });
    }
  },
  getNotificationByDevice: async function (req, res) {
    try {
      const pro = await categoryModel.find({deviceId:req.body.deviceId});
      res.status(200).json({ data: pro });
    } catch (err) {
      res.status(500).json({ msg: "Internal serve error" });
    }
  },
  searchLive: async function (req, res) {
    try {
      let size = req.body.size || 10;
      let pageNo = req.body.pageNo || 1; 
      const query={};
      query.skip = Number(size * (pageNo - 1));
      query.limit = Number(size) || 0;
      const sort = { _id: -1 };
      const totalLive = await streamModel.countDocuments({title: { $regex: req.body.search, $options: 'i' },type:'live',isLive:true});
      if(totalLive>0){
          const live = await streamModel.find({title: { $regex: req.body.search, $options: 'i' },type:'live',isLive:true}).populate({path:"vendorId",select:"name"}).populate({path:"userId",select:"username"}).populate("productId").sort(sort).skip(query.skip).limit(query.limit);
          res.status(200).json({data:live,total:totalLive});
      }else{
          res.status(200).json({data:[],total:totalLive}); 
      }
      
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
  },
  getSales:async function(req,res){
    const totalProduct = await productModel.countDocuments({isActive: true,vendorId:req.body.creatorId});
    const totalOrder = await orderModel.countDocuments({vendorId:req.body.creatorId});
    const totalVideos = await reelModel.countDocuments({userId:req.body.creatorId});
    res.status(200).json({totalProduct,totalOrder,totalVideos});

  }


};
