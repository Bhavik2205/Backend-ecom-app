const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const jwt = require("../config/jwt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getVideoDurationInSeconds } = require("get-video-duration");
const { S3 } = require("@aws-sdk/client-s3");

const AWS_ACCESS_KEY_ID = "AKIAVWAREZSMWFIKN6CEAKIA";
const AWS_SECRET_ACCESS_KEY = "JoCfiXzHP4g2Cce+ytpXzH4iU+S4CP5h3H8CyD3lrT";
const AWS_REGION = "ap-northeast-1";
const reelModel = require("../models/reelModel");
const { default: mongoose } = require("mongoose");
const likModel = require("../models/likeModel");
const followModel = require("../models/followModel");
const productModel = require("../models/productModel");

const s3 = new S3({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

//User Routes
router.post("/createUser", adminController.createAndUpdateUser);
router.post("/checkUsername", adminController.checkUserName);
router.post("/sendOtp", adminController.sendOtp);
router.post("/login", adminController.loginUser);
router.post("/socialLogin", adminController.createAndLoginSocialUser);
router.post("/doLogin", adminController.dashboardLogin);
router.post("/logOut", adminController.logOutUser);
router.get("/user/:id", adminController.getUserById);
router.get("/getAllBusinessUser", adminController.getAllBusinessUser);
router.get("/getAllCreatorUser", adminController.getAllCreatorUser);
router.get("/getAllNormalUser", adminController.getAllNormalUser);
router.post("/updatePassword", adminController.updatePassword);
router.post("/recoverPassword", adminController.recoverPassword);
router.post("/searchBrands",adminController.searchBrands);
router.post("/searchProduct",adminController.searchProduct);
router.get("/product/:id", adminController.getProductById);
router.get("/productById/:id", adminController.getProductByIdWeb);
router.post("/productExcel", adminController.uploadProductExcel);

router.post("/getAllUser", adminController.getAllUser);
router.post("/getAllUserByType", adminController.getAllUserByType);
router.post("/getAllProduct", adminController.getAllProduct);
router.post("/getAllOrder", adminController.getAllOrder);

//coupon
router.post("/createCoupon", adminController.createAndUpdateCoupon);
router.post("/getCouponByVendor", adminController.getCouponByVendor);

//Inventory routes
router.post("/addProduct", adminController.createAndUpdateProduct);
router.post("/addToCart", adminController.addToCart);
router.post("/getProductByVendor", adminController.getProductByVendor);

//category and sub category routes
router.post("/createCategory", adminController.createAndUpdateCat);
router.post("/createSubCategory", adminController.createAndUpdateSubCat);
router.get("/getCategory", adminController.getCategory);
router.post("/getAllCategory", adminController.getAllCategoryWithPagination);
router.post("/getSubCategory", adminController.getSubCategoryByCat);
router.get("/category/:id", adminController.getCategoryById);



//cart
router.post("/getCartByUser", adminController.getCartByUser);

//order
router.post("/createOrder", adminController.createOrder);
router.post("/updateOrder", adminController.createAndUpdateOrder);
router.post("/createOrderV2", adminController.createOrderV2);
router.post("/getOrderByOrderId", adminController.getOrderByOrderId);
router.post("/getOrderByStatus", adminController.getOrderByStatus);
router.post("/getOrderByVendor", adminController.getOrderByVendor);

//get s3 upload videos
router.post("/likeVideo",adminController.setlikeVideo);
router.post("/commentVideo",adminController.setCommentVideo);
router.post("/addFollower",adminController.addFollower);
router.post("/removeFollower",adminController.removeFollower);
router.post("/getFollowerById",adminController.getFollowerById);
router.post("/getFollowingById",adminController.getFollowingById);
router.post("/getLikeByVideoId",adminController.getLikeByVideoId);
router.post("/getCommentByVideoId",adminController.getCommentByVideoId);

//golive
router.post("/goLiveWithProduct",adminController.goLiveWithProduct);
router.post("/endLiveStream",adminController.endLiveStream);
router.post("/searchLive",adminController.searchLive);

//notification api
router.post("/notification",adminController.sendNotification);
router.post("/getNotificationByDevice",adminController.getNotificationByDevice);

//count dashboard
router.get("/getDashboardCount",adminController.getDashboardCount);
router.post("/getDashboardCountByBusiness",adminController.getDashboardCountByBusiness);

router.post("/getLiveSession",adminController.getLiveSession);
router.post("/getScheduledSession",adminController.getScheduledSession);
router.post("/getSales",adminController.getSales);






router.post('/getReelsById',async (req,res)=>{

  try{
    const params = {
      Bucket: 'livvyshoppingapp',
      Prefix: `reels/${req.body.userId}/`,
      Delimiter: '/'
    };
    const response = await s3.listObjectsV2(params);

    if(response.Contents){
      const videoData = response.Contents.filter(item => item.Key.endsWith('.mp4')).map(item => {
        const key = item.Key;
        const id = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
        const url = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
    
        return { id, url };
      });
  
      const reelData = await reelModel.find({userId:req.body.userId}).populate('userId');      
      // videoData.forEach(obj1 => {
        for (const obj1 of videoData) {
        const matchingObj2 = reelData.find(obj2 => obj2.videoId === obj1.id);
        let prodArr = [];

        for (const rel of reelData) {
           for (const prod of rel.products) {
             let objpro = await productModel.findOne({_id:prod}).populate({path:"vendorId",select:"name"}).populate({path:"categoryId",select:"name"}).populate({path:"subcategoryId",select:"name"});
             if(objpro){
              prodArr.push(objpro);
             }
           }
        }
        obj1.products = prodArr;
        if (matchingObj2) {
          obj1.description = matchingObj2.description;
          obj1.user = matchingObj2.userId;
          obj1.videoId = matchingObj2._id;
          obj1.thumnail = matchingObj2.thumbnail ?? '';
        }
        prodArr = [];
      }

  
      res.status(200).json({"status":"ok",data:videoData});

    }
    else{
      res.status(200).json({"status":"ok","msg":"no reel found"});
    }
  }
  catch(err){
    res.status(400).json({err});
  }

})

router.post('/getAllReels',async (req,res)=>{

  // try{
    const params = {
      Bucket: 'livvyshoppingapp',
      MaxKeys: req.body.limit,
      Prefix: '',
    };

    if(req.body.nextToken){
      params.ContinuationToken = req.body.nextToken;
    }
    let response = await s3.listObjectsV2(params);

    if (response.IsTruncated) {
      if(response.Contents){
        const videoData = response.Contents.filter(item => item.Key.endsWith('.mp4')).map(item => {
          const key = item.Key;
          const id = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
          const userId = key.substring(key.indexOf('/') + 1, key.lastIndexOf('/'));
          const url = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
      
          return { id, url, userId};
        });
        for (const obj1 of videoData) {
          const reelData = await reelModel.find({userId:obj1.userId}).populate('userId');
          const matchingObj2 = reelData.find(obj2 => obj2.videoId == obj1.id);
          const followData = await followModel.countDocuments({follower:req.body.userId,following:obj1.userId})
          if(followData > 0) {
            obj1.isFollow = true;
          }
          else{
            obj1.isFollow = false;
          }
          let prodArr = [];

          for (const rel of reelData) {
             for (const prod of rel.products) {
               let objpro = await productModel.findOne({_id:prod}).populate({path:"vendorId",select:"name"}).populate({path:"categoryId",select:"name"}).populate({path:"subcategoryId",select:"name"});
               if(objpro){
                prodArr.push(objpro);
               }
             }
          }
          obj1.products = prodArr;
          if (matchingObj2) {
            const likeData = await likModel.countDocuments({userId:req.body.userId,videoId:matchingObj2._id});
            if(likeData > 0) {
              obj1.isLike = true;
            }
            else{
              obj1.isLike = false;
            }
            obj1.description = matchingObj2.description;
            obj1.user = matchingObj2.userId;
            obj1.videoId = matchingObj2._id;
            obj1.thumnail = matchingObj2.thumbnail ?? '';
            delete obj1.userId
          } 
        }
        res.status(200).json({"status":"ok","data":videoData,"nextToken":response.NextContinuationToken});
      }
    }
    else{

      if(response.Contents){
        const videoData = response.Contents.filter(item => item.Key.endsWith('.mp4')).map(item => {
          const key = item.Key;
          const id = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
          const userId = key.substring(key.indexOf('/') + 1, key.lastIndexOf('/'));
          const url = `https://${params.Bucket}.s3.amazonaws.com/${key}`;
      
          return { id, url,userId };
        });
   
        for (const obj1 of videoData) {
          const reelData = await reelModel.find({userId:obj1.userId}).populate('userId');
          const matchingObj2 = reelData.find(obj2 => obj2.videoId == obj1.id);
          const followData = await followModel.countDocuments({follower:req.body.userId,following:obj1.userId});
          if(followData > 0) {
            obj1.isFollow = true;
          }
          else{
            obj1.isFollow = false;
          }
          let prodArr = [];

          for (const rel of reelData) {
             for (const prod of rel.products) {
               let objpro = await productModel.findOne({_id:prod}).populate({path:"vendorId",select:"name"}).populate({path:"categoryId",select:"name"}).populate({path:"subcategoryId",select:"name"});
               if(objpro){
                prodArr.push(objpro);
               }
             }
          }
          obj1.products = prodArr;
          if (matchingObj2) {
            const likeData = await likModel.countDocuments({userId:req.body.userId,videoId:matchingObj2._id});
            if(likeData > 0) {
              obj1.isLike = true;
            }
            else{
              obj1.isLike = false;
            }
            obj1.description = matchingObj2.description;
            obj1.user = matchingObj2.userId;
            obj1.videoId = matchingObj2._id;
            obj1.thumnail = matchingObj2.thumbnail ?? '';
            delete obj1.userId
          } 
        } 
        res.status(200).json({"status":"ok",data:videoData});

      }
    }
  // }
  // catch(err){
  //   res.status(400).json({err});
  // }

})


const imageStorage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(png|jpg|JPG|jpeg|JPEG|PNG|docx|jfif|xlsx)$/)
    ) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/uploadImage",
  imageUpload.single("image"),
  (req, res) => {
    res.send({
      imageName: req.file.filename,
      msg: "Upload succesfully",
      status: "ok",
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExt;
     cb(null, fileName);
    },
  }),
});

router.post("/uploadVideo", upload.single("video"), async (req, res) => {
  let path = __dirname + "/../uploads/" + req.file.filename;
  getVideoDurationInSeconds(path).then( async (duration) => {
    let dur = Math.trunc(duration);
    if (dur > 20) {
      fs.unlink(path, function (err) {
        if (err) {
          console.error(err);
        }
        res.status(400).send("Video duration must be at least 20 seconds");
      });
    } else {
      // Read the video file from disk
      const videoFile = fs.readFileSync(path);
      // Set the S3 bucket and object key
      const s3Bucket = "livvyshoppingapp";
      const s3ObjectKey = `reels/${req.body.userId}/${req.file.filename}`;
      // Set additional S3 metadata if needed
      const s3Metadata = {
        "Content-Type": "video/mp4",
      };
      // Upload the video file to S3 and assign it the specified object ID
     const result = await s3.putObject({
        Bucket: s3Bucket,
        Key: s3ObjectKey,
        Body: videoFile,
        ContentType: 'video/mp4',
        Endpoint:"livvyshoppingapp.s3-accelerate.amazonaws.com"
      });

      const vname = req.file.filename.substring(0, req.file.filename.lastIndexOf('.'));
      const reelBody = {
        userId: req.body.userId,
        videoId:vname,
        description:req.body.description,
        products: req.body.products,
        thumbnail:req.body.thumbnail
      }
      if(result.$metadata.httpStatusCode == 200){
        await reelModel.create(reelBody);
        res.status(200).json({"status":"ok","msg":"Video Uploaded Success"});
      }
      else{
      res.status(400).json({"status":"error","msg":"Error on uploading!"});
      }
    }
  });
});

module.exports = router;
