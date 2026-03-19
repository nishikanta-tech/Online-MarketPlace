// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     orderItems: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           default: 1
//         },
//         price: {
//           type: Number,
//           required: true
//         }
//       }
//     ],

//     shippingAddress: {
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       pincode: { type: String, required: true }
//     },

//     totalAmount: {
//       type: Number,
//       required: true
//     },

//     paymentMethod: {
//       type: String,
//       enum: ["COD", "UPI", "Card"],
//       default: "COD"
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Paid"],
//       default: "Pending"
//     },

//     orderStatus: {
//       type: String,
//       enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending"
//     }
//   },
//   { timestamps: true }
// );

// const OrderModel = mongoose.model("Order", orderSchema);
// module.exports = OrderModel;


// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     orderItems: [
//       {
//         productId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           default: 1
//         },
//         price: {
//           type: Number,
//           required: true
//         }
//       }
//     ],

//     shippingAddress: {
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       state: { type: String, required: true },
//       pincode: { type: String, required: true }
//     },

//     totalAmount: {
//       type: Number,
//       required: true
//     },

//     // 🔧 FIXED HERE
//     paymentMethod: {
//       type: String,
//       enum: ["cod", "upi", "card"],
//       default: "cod"
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Paid"],
//       default: "Pending"
//     },

//     orderStatus: {
//       type: String,
//       enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending"
//     }
//   },
//   { timestamps: true }
// );

// const OrderModel = mongoose.model("Order", orderSchema);
// module.exports = OrderModel;


const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],

    // ✅ shippingAddress as OBJECT (matches your Checkout.jsx)
    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      address:  { type: String, required: true },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      country:  { type: String, default: "India" }
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Card"],   // matches Checkout.jsx values (lowercase)
      required: true
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending"
    },

    totalAmount: {
      type: Number,
      required: true
    },

    deliveredAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);