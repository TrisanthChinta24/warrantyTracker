const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const s3 = require("../config/s3");


const storage = multerS3({
  s3,
  bucket: "warranty-tracer-uploads",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `warranties/${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

function fileFilter(req, file, cb) {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed!"), false);
  }
}

const upload = multer({ storage, fileFilter });
module.exports = upload;
