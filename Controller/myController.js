const UserModel = require('../Models/UserModel');
const ProductModel = require('../Models/ProductModel');
const OrderModel = require('../Models/OrderModel');
const CartModel = require('../Models/CartModel');
const PaymentModel = require('../Models/PaymentModel');
const RatingModel = require('../Models/RatingModel'); 
const OTPModel = require('../Models/OTPModel');  
const crypt = require('bcrypt');
const nodemailer = require('nodemailer');


// Configure email transporter



const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user with this email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Delete any existing OTPs for this email (cleanup)
    await OTPModel.deleteMany({ email });

    // Store OTP in database with 5 minute expiration
    await OTPModel.create({
      email: email,
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Email content
    const mailOptions = {
      from: 'nishikanta394@gmail.com',
      to: email,
      subject: 'Your OTP for Registration',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Email Verification</h2>
          <p>Thank you for registering! Your OTP for email verification is:</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6B7280;">This OTP will expire in 5 minutes.</p>
          <p style="color: #6B7280;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'OTP sent successfully to your email',
      success: true 
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP. Please try again.',
      error: error.message 
    });
  }
};

// Register user with OTP verification
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, dob, gender, role, otp } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !address || !otp) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find OTP record
    const otpRecord = await OTPModel.findOne({ email }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTPModel.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Verify OTP
    if (Number(otpRecord.otp) !== Number(otp)) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP is valid, delete it
    await OTPModel.deleteOne({ _id: otpRecord._id });

    // Hash password
    const hashedPassword = await crypt.hash(password, 10);

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      dob,
      gender,
      role: role || 'user',
      isVerified: true // Email is verified via OTP
    });

    return res.status(201).json({ 
      message: 'Registration successful! Please login.',
      success: true
    });

  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ 
      message: 'Registration failed. Please try again.',
      error: error.message 
    });
  }
};

// for logging in the user
exports.login = async (req, res) => {
  try {
    const body = req.body;
    //  console.log("LOGIN BODY:", body); 
    
    if (!body.email || !body.password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserModel.findOne({ email: body.email });
    // console.log("USER FOUND:", user);
     
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    } else {
        isVerified = user.isVerified = true;
        // set user is active
        user.status = 'active';
        

    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const isMatch = await crypt.compare(body.password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    return res.json({
      message: "Login successful",
      role: user.role,
      name: user.name,
      id: user._id,
      email: user.email
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ 
      message: 'Login failed. Please try again.',
      error: error.message 
    });
  }

};

exports.addProduct = async (req, res) => {
  try {
    const { productName, description, price, category, stockQuantity, sellerId } = req.body;
    const image = req.file ? req.file.path : null;
    
    if (!productName || !description || !price || !category || !stockQuantity || !sellerId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newProduct = new ProductModel({
      productName,
      description,
      price,
      image,
      category,
      stockQuantity,
      sellerId
    });

    const saved = await newProduct.save();
    res.json({ message: 'Product added successfully', product: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.fetchProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.fetchProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await ProductModel.find({ category: category });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { productName, description, price, category, stockQuantity } = req.body;
    const image = req.file ? req.file.path : null;

    const updateData = {
      productName,
      description,
      price,
      category,
      stockQuantity
    };

    if (image) {
      updateData.image = image; 
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, updateData, {
      new: true
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: "Product Updated", product: updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await ProductModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.singleProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await ProductModel.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Delete any existing OTPs for this email
    await OTPModel.deleteMany({ email });

    // Store OTP in database
    await OTPModel.create({
      email: email,
      otp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Email content
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>You requested to reset your password. Your OTP is:</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6B7280;">This OTP will expire in 5 minutes.</p>
          <p style="color: #6B7280;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'OTP sent to your email for password reset',
      success: true 
    });

  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP. Please try again.',
      error: error.message 
    });
  }
};

// Reset Password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find OTP record
    const otpRecord = await OTPModel.findOne({ email }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTPModel.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP is valid, delete it
    await OTPModel.deleteOne({ _id: otpRecord._id });

    // Hash new password
    const hashedPassword = await crypt.hash(newPassword, 10);

    // Update user password
    const user = await UserModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Password reset successful! You can now login with your new password.',
      success: true 
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      message: 'Password reset failed. Please try again.',
      error: error.message 
    });
  }
};

// Get user/seller by ID (for marketplace)
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id).select('-password'); // Exclude password
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find product to get price
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product has enough stock
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Find or create cart for user
    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new CartModel({
        userId,
        cartItems: [{
          productId,
          quantity,
          price: product.price
        }],
        totalPrice: product.price * quantity
      });
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.cartItems.findIndex(
        item => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.cartItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.cartItems.push({
          productId,
          quantity,
          price: product.price
        });
      }

      // Recalculate total price
      cart.totalPrice = cart.cartItems.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
    }

    await cart.save();
    res.status(200).json({ message: 'Added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cart = await CartModel.findOne({ userId }).populate('cartItems.productId');

    if (!cart) {
      return res.json({ cartItems: [], totalPrice: 0 });
    }

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Cart Item Quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.cartItems.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check product stock
    const product = await ProductModel.findById(productId);
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    cart.cartItems[itemIndex].quantity = quantity;

    // Recalculate total
    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    await cart.save();
    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.cartItems = cart.cartItems.filter(
      item => item.productId.toString() !== productId
    );

    // Recalculate total
    cart.totalPrice = cart.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    await cart.save();
    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.cartItems = [];
    cart.totalPrice = 0;

    await cart.save();
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// exports.createOrder = async (req, res) => {
//   try {
//     const { userId, items, shippingAddress, paymentMethod } = req.body;

//     if (!userId || !items || !shippingAddress || !paymentMethod) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Calculate total
//     let totalAmount = 0;
//     const orderItems = [];

//     for (const item of items) {
//       const product = await ProductModel.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({ message: `Product ${item.productId} not found` });
//       }

//       if (product.stockQuantity < item.quantity) {
//         return res.status(400).json({ message: `Insufficient stock for ${product.productName}` });
//       }

//       const itemTotal = product.price * item.quantity;
//       totalAmount += itemTotal;

//       orderItems.push({
//         productId: item.productId,
//         productName: product.productName,
//         quantity: item.quantity,
//         price: product.price
//       });

//       // Reduce stock
//       product.stockQuantity -= item.quantity;
//       await product.save();
//     }

//     // Create order
//     const order = await OrderModel.create({
//       userId,
//       items: orderItems,
//       totalAmount,
//       shippingAddress,
//       paymentMethod,
//       orderStatus: 'pending',
//       paymentStatus: 'pending'
//     });

//     // Clear cart after order
//     const cart = await CartModel.findOne({ userId });
//     if (cart) {
//       cart.cartItems = [];
//       cart.totalPrice = 0;
//       await cart.save();
//     }

//     res.status(201).json({ 
//       message: 'Order placed successfully', 
//       order,
//       orderId: order._id 
//     });
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ message: error.message });
//   }
// };


exports.createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName}`
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });

      product.stockQuantity -= item.quantity;
      await product.save();
    }

    const order = await OrderModel.create({
      userId,
      orderItems,                 // ✅ correct name
      shippingAddress,
      totalAmount,
      paymentMethod,
      orderStatus: "Pending",     // ✅ enum match
      paymentStatus: "Pending"    // ✅ enum match
    });

    // Clear cart
    await CartModel.findOneAndUpdate(
      { userId },
      { cartItems: [], totalPrice: 0 }
    );

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};


// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await OrderModel.findById(orderId).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Order Status (for sellers/admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
};

// controllers/userController.js


exports.getUserProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Add these functions to your myController.js file

// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Dashboard Stats (Admin only)
exports.getAdminStats = async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await UserModel.countDocuments({ role: 'user' });
    const totalSellers = await UserModel.countDocuments({ role: { $in: ['seller', 'admin'] } });
    
    // Count products
    const totalProducts = await ProductModel.countDocuments();
    
    // Count orders
    const totalOrders = await OrderModel.countDocuments();
    const pendingOrders = await OrderModel.countDocuments({ orderStatus: 'Pending' });
    
    // Calculate total revenue
    const orders = await OrderModel.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    res.status(200).json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete User (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await UserModel.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update User Role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!['user', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'User role updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: error.message });
  }
};



// CREATE ORDER  (updated to match Checkout.jsx)
// ─────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, totalAmount } = req.body;

    // Validate required fields
    if (!userId || !items || items.length === 0 || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate shippingAddress fields (sent as object from Checkout.jsx)
    const { fullName, phone, address, city, state, pincode } = shippingAddress;
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName}`
        });
      }

      calculatedTotal += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        quantity:  item.quantity,
        price:     product.price
      });

      // Reduce stock
      product.stockQuantity -= item.quantity;
      await product.save();
    }

    // Use totalAmount from frontend (includes shipping + tax)
    // or fall back to calculated product total
    const finalTotal = totalAmount || calculatedTotal;

    const order = await OrderModel.create({
      userId,
      orderItems,
      shippingAddress,           // ✅ saved as object
      totalAmount: finalTotal,
      paymentMethod,             
      orderStatus:   'Pending',
      paymentStatus: 'Pending'
    });

    // Clear cart after order
    await CartModel.findOneAndUpdate(
      { userId },
      { cartItems: [], totalPrice: 0 }
    );

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// GET PAYMENT BY ORDER ID
// GET /api/payment/order/:orderId
// Called in Payment.jsx → fetchOrderAndPayment()
// ─────────────────────────────────────────────
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await PaymentModel.findOne({ orderId })
      .populate('userId', 'name email')
      .populate('orderId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found for this order' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// UPDATE PAYMENT STATUS
// PUT /api/payment/status
// Called in Payment.jsx → handleUPIPayment()
// Body: { paymentId, paymentStatus, transactionId }
// ─────────────────────────────────────────────
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, paymentStatus, transactionId } = req.body;

    if (!paymentId || !paymentStatus) {
      return res.status(400).json({ message: 'paymentId and paymentStatus are required' });
    }

    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.paymentStatus = paymentStatus;

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    if (paymentStatus === 'Success') {
      payment.paidAt = new Date();

      // Also mark the order as Paid
      await OrderModel.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'Paid'
      });
    }

    await payment.save();

    res.status(200).json({
      message: 'Payment status updated successfully',
      payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// CREATE PAYMENT RECORD
// POST /api/payment/create
// Called from Checkout.jsx after order is created
// Body: { userId, orderId, paymentMethod, amount }
// ─────────────────────────────────────────────
exports.createPayment = async (req, res) => {
  try {
    const {
      userId,
      orderId,
      paymentMethod,
      amount,
      upiDetails   // ✅ ADD THIS
    } = req.body;

    if (!userId || !orderId || !paymentMethod || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent duplicate payment records
    const existing = await PaymentModel.findOne({ orderId });
    if (existing) {
      return res.status(200).json({
        message: "Payment record already exists",
        payment: existing
      });
    }

    const payment = await PaymentModel.create({
      userId,
      orderId,
      paymentMethod,
      amount,
      paymentStatus: "Pending",

      // ✅ SAVE UPI DETAILS ONLY IF UPI
      upiDetails: paymentMethod === "UPI" ? upiDetails : undefined,

      transactionId:
        paymentMethod === "UPI" || paymentMethod === "CARD"
          ? `TXN${Date.now()}`
          : null
    });

    res.status(201).json({
      message: "Payment record created",
      payment
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────
// GET USER PAYMENTS (payment history)
// GET /api/payments/:userId
// ─────────────────────────────────────────────
exports.getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await PaymentModel.find({ userId })
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────

// GET ALL PAYMENTS (admin)
// GET /api/admin/payments
// ─────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find()
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: error.message });
  }
};


