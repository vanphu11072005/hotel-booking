const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const avatarsDir = path.join(__dirname, '../../uploads/avatars');
const roomsDir = path.join(__dirname, '../../uploads/rooms');
const roomTypesDir = path.join(__dirname, '../../uploads/room_types');
const bannersDir = path.join(__dirname, '../../uploads/banners');

[avatarsDir, roomsDir, bannersDir, roomTypesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for avatars
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    cb(null, name);
  }
});

// Storage for room images
// Previously room images were saved under uploads/rooms.
// Images are now associated with room_types; upload storage
// for room-type images will use `uploads/room_types`.
const roomStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, roomTypesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `roomtype_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    cb(null, name);
  }
});

// Storage for banner images
const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bannersDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `banner_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

// Avatar upload (default)
const upload = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Room images upload
const uploadRoomImages = multer({
  storage: roomStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
});

// Banner upload
const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
module.exports.uploadRoomImages = uploadRoomImages;
module.exports.uploadBanner = uploadBanner;
