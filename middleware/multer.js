const multer = require('multer');
const path = require('path');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/avif': 'avif'
}

const destinationPath = path.join(__dirname, '../public/malefashion-master/images');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadMulter = multer({ storage: storage });

module.exports = uploadMulter;
