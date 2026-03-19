const multer = require('multer');
const storage = multer.diskStorage({
//to store the uploaded image in specific
    destination: function (req, file, cb){
        cb(null, 'Products/images');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }

});

const upload = multer({ storage: storage});
module.exports = upload;

// In your multer config file (e.g., multerConfig.js)
// const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'Products/images');
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB per file
//   },
//   fileFilter: (req, file, cb) => {
//     // Accept only image files
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'), false);
//     }
//   }
// });

// // Export different upload methods
// module.exports = {
//   single: upload.single('image'), // For single image (backward compatibility)
//   array: upload.array('images', 4), // For multiple images (max 4)
//   any: upload.any() // Accept any number of files with any field name
// };