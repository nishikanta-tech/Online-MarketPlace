

// const mongoose = require("mongoose");
// const paymentSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     orderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Order",
//       required: true
//     },

//     paymentMethod: {
//       type: String,
//       enum: ["COD", "UPI", "Card"],
//       required: true
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Success", "Failed"],
//       default: "Pending"
//     },

//     transactionId: {
//       type: String
//     },

//     amount: {
//       type: Number,
//       required: true
//     },

//     paidAt: {
//       type: Date
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Payment", paymentSchema);


const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD"],
      set: v => v.toUpperCase(),
      required: true
    },

    // ✅ ADD THIS
    upiDetails: {
      upiId: {
        type: String
      },
      utrNo: {
        type: String
      }
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending"
    },

    transactionId: String,

    amount: {
      type: Number,
      required: true
    },

    paidAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
