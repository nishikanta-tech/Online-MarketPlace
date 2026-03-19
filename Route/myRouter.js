// const express = require('express');
// const router = express.Router();
// const UserController = require('../Controller/myController');
// const upload = require('../middleware/uploadImage');



// router.post('/register', UserController.register);
// router.post('/login', UserController.login);
// router.post('/addProduct', upload.single('image'), UserController.addProduct);
// router.get('/fetchProducts', UserController.fetchProducts);
// router.get('/fetchProducts/:category', UserController.fetchProductsByCategory);
// router.put('/updateProduct/:id', upload.single('image'), UserController.updateProduct);
// router.get('/singleProduct/:id', UserController.singleProduct);
// router.delete('/deleteProduct/:id', UserController.deleteProduct);
// router.post('/sendOTP', UserController.sendOTP);
// router.get('/user/:id', UserController.getUserById);
// // Password Reset Routes
// router.post('/forgotPassword', UserController.forgotPassword);
// router.post('/resetPassword', UserController.resetPassword);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const UserController = require('../Controller/myController');
// const upload = require('../middleware/uploadImage');

// // Authentication Routes
// router.post('/register', UserController.register);
// router.post('/login', UserController.login);
// router.post('/sendOTP', UserController.sendOTP);

// // router.get('/users', authMiddleware, adminMiddleware, UserController.getAllUsers);

// // Password Reset Routes
// router.post('/forgotPassword', UserController.forgotPassword);
// router.post('/resetPassword', UserController.resetPassword);

// // Product Routes
// router.post('/addProduct', upload.single('image'), UserController.addProduct);
// router.get('/fetchProducts', UserController.fetchProducts);
// router.get('/fetchProducts/:category', UserController.fetchProductsByCategory);
// router.put('/updateProduct/:id', upload.single('image'), UserController.updateProduct);
//  router.get('/singleProduct/:id', UserController.singleProduct);
// router.delete('/deleteProduct/:id', UserController.deleteProduct);
// // routes/userRoutes.js
// router.get('/profile/:id', UserController.getUserProfile);


// router.post('/cart/add', UserController.addToCart);
// router.get('/cart/:userId', UserController.getCart);
// router.put('/cart/update', UserController.updateCartItem);
// router.delete('/cart/remove', UserController.removeFromCart);
// router.delete('/cart/clear/:userId', UserController.clearCart);

// router.post('/order/createOrder', UserController.createOrder);
//    router.get('/orders/:userId', UserController.getUserOrders);
//    router.get('/order/:orderId', UserController.getOrderById);
//    router.put('/order/status', UserController.updateOrderStatus);

// // IMPORTANT: Add these two routes for product detail and marketplace
// router.get('/product/:id', UserController.singleProduct);  // For ProductDetail component
// router.get('/user/:id', UserController.getUserById);       // For Marketplace component

// // Add these routes to your routes file (after your existing routes)

// // Admin Routes - Add these to your userRoutes.js or create adminRoutes.js
// router.get('/admin/users', UserController.getAllUsers);           // Get all users
// router.get('/admin/orders', UserController.getAllOrders);         // Get all orders
// router.get('/admin/stats', UserController.getAdminStats);         // Get dashboard stats
// router.delete('/admin/user/:id', UserController.deleteUser);      // Delete user
// router.put('/admin/user/role', UserController.updateUserRole);    // Update user role

// // Alternative: If you want to keep it RESTful, you can use:
// router.get('/users', UserController.getAllUsers);                  // Get all users
// router.get('/orders/all', UserController.getAllOrders);            // Get all orders

// // Note: In production, you should add authentication middleware to protect admin routes
// // Example:
// // router.get('/admin/users', authMiddleware, adminMiddleware, UserController.getAllUsers);

// module.exports = router;

const express = require('express');
const router = express.Router();
const UserController = require('../Controller/myController');
const upload = require('../middleware/uploadImage');

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/sendOTP', UserController.sendOTP);

// Password Reset Routes
router.post('/forgotPassword', UserController.forgotPassword);
router.post('/resetPassword', UserController.resetPassword);

// ==========================================
// ADMIN ROUTES (Must come BEFORE dynamic routes)
// ==========================================
router.get('/getAllUsers', UserController.getAllUsers);           // Get all users
router.get('/getAllOrders', UserController.getAllOrders);         // Get all orders
router.get('/admin/stats', UserController.getAdminStats);         // Get dashboard stats
router.delete('/admin/user/:id', UserController.deleteUser);      // Delete user
router.put('/admin/user/role', UserController.updateUserRole);    // Update user role

// Note: In production, add authentication middleware to protect admin routes
// Example: router.get('/admin/users', authMiddleware, adminMiddleware, UserController.getAllUsers);

// ==========================================
// PRODUCT ROUTES
// ==========================================
router.post('/addProduct', upload.single('image'), UserController.addProduct);
router.get('/fetchProducts', UserController.fetchProducts);
router.get('/fetchProducts/:category', UserController.fetchProductsByCategory);
router.put('/updateProduct/:id', upload.single('image'), UserController.updateProduct);
router.get('/singleProduct/:id', UserController.singleProduct);
router.delete('/deleteProduct/:id', UserController.deleteProduct);

// Product detail route (alternative endpoint)
router.get('/product/:id', UserController.singleProduct);

// ==========================================
// USER ROUTES
// ==========================================
router.get('/profile/:id', UserController.getUserProfile);
router.get('/user/:id', UserController.getUserById);  // For Marketplace component

// ==========================================
// CART ROUTES
// ==========================================
router.post('/cart/add', UserController.addToCart);
router.get('/cart/:userId', UserController.getCart);
router.put('/cart/update', UserController.updateCartItem);
router.delete('/cart/remove', UserController.removeFromCart);
router.delete('/cart/clear/:userId', UserController.clearCart);

// ==========================================
// ORDER ROUTES
// ==========================================
router.post('/order/createOrder', UserController.createOrder);
router.get('/orders/:userId', UserController.getUserOrders);
router.get('/order/:orderId', UserController.getOrderById);
router.put('/order/status', UserController.updateOrderStatus);

// PAYMENT ROUTES  ← NEW (needed by Payment.jsx)
router.post('/payment/create',            UserController.createPayment);        // Checkout.jsx
router.get ('/payment/order/:orderId',    UserController.getPaymentByOrderId);  // ✅ Payment.jsx
router.put ('/payment/status',            UserController.updatePaymentStatus);   // ✅ Payment.jsx
router.get ('/payments/:userId',          UserController.getUserPayments);       // history            
router.get("/getAllPayments", UserController.getAllPayments);

module.exports = router;