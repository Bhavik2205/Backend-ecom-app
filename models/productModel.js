const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sku:{
   type:String
  },
  name: {
    type: String,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
  },
  description: {
    type: String,
  },
  default: {
    type: String,
  },
  combination: {
    type: Array,
  },
  weight: {
    type: String,
  },
  length: {
    type: String,
  },
  breadth: {
    type: String,
  },
  height: {
    type: String,
  },
  productRating:{
    type:String
  },
  warranty:{
    type:String
  },
  material:{
    type:String
  },
  washingDetail:{
    type:String
  },
  isActive: Boolean,
  created: {
    type: Date,
    default: function() {
      return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
    }
  },
});

const product = mongoose.model("Product", productSchema);

module.exports = product;
