const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const decodeBase64Image = require("../../utils/decodeBase64Image");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadPhoto = upload.single("photo");

exports.saveImage = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (!req.body.photo) return next(new AppError("Please provide Image", 400));

  const photo = decodeBase64Image(req.body.photo);
  await sharp(photo.data)
    .toFormat("webp")
    .webp({ quality: 60 })
    .toFile(`./public/static/${req.body.name}.webp`);

  return res.status(200).json({ msg: "Photo Successfully Uploaded" });
});
