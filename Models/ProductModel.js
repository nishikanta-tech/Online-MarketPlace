// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//     productName: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     description: {
//       type: String,
//       required: true
//     },

//     price: {
//       type: Number,
//       required: true
//     },

//     category: {
//       type: String,
//       required: true,
//       enum: ["Electronics", "Clothing", "Books", "Home", "Beauty", "Sports", "Toys", "Other"],
//       default: "Other"
//     },

//     image: {
//       type: String,
//       required: true
//     },

//     stockQuantity: {
//       type: Number,
//       required: true,
//       default: 1
//     },

//     sellerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     rating: {
//       type: Number,
//       default: 0
//     }
//   },
//   { timestamps: true }
// );

// const ProductModel = mongoose.model("Product", productSchema);
// module.exports = ProductModel;

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Books", "Home", "Beauty", "Sports", "Toys", "Other"],
      default: "Other"
    },

    // Main image field (keep for backward compatibility)
    image: {
      type: String,
      required: true
    },

    // New array field for multiple images (optional)
    images: [{
      type: String
    }],

    stockQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
);

// Add indexes for better performance
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ rating: -1 });

// Pre-save middleware to handle images array
productSchema.pre('save', function(next) {
  // If images array is not provided but image field exists, create images array
  if ((!this.images || this.images.length === 0) && this.image) {
    this.images = [this.image];
  }
  
  // If images array exists but no main image, set first image as main
  if (this.images && this.images.length > 0 && !this.image) {
    this.image = this.images[0];
  }
  
  next();
});

const ProductModel = mongoose.model("Product", productSchema);
module.exports = ProductModel;