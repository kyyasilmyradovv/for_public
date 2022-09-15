const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const decodeBase64Image = require("../../utils/decodeBase64Image");
const {
  Videobanners,
  Videobannerproducts,
  Products,
  Productimages,
  Collections,
  Brands,
} = require("../../models");

exports.getAllVideobanners = catchAsync(async (req, res) => {
  const { limit, offset } = req.query;
  const { count, rows } = await Videobanners.findAndCountAll({
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  return res.status(200).json({
    pagination: {
      all: count,
      limit,
      current_page: Math.floor(offset / limit) + 1,
      next: count - offset > limit,
    },
    data: rows,
  });
});

exports.getVideobanner = catchAsync(async (req, res, next) => {
  const videobanner = await Videobanners.findOne({
    where: { uuid: req.params.uuid },
    include: {
      model: Products,
      as: "products",
      include: {
        model: Productimages,
        as: "product_images",
      },
    },
  });
  if (!videobanner) return next(new AppError("Videobanner not found", 404));

  if (videobanner.collectionId != null)
    videobanner.dataValues.collection = await Collections.findOne({
      where: { id: videobanner.collectionId },
    });
  if (videobanner.brandId != null)
    videobanner.dataValues.brand = await Brands.findOne({
      where: { id: videobanner.brandId },
    });

  return res.status(200).send(videobanner);
});

exports.addVideobanner = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const newVideobanner = await Videobanners.create(req.body);

  for (productId of req.body.productIds) {
    await Videobannerproducts.create({
      productId,
      videobannerId: newVideobanner.id,
    });
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 55 })
      .toFile(`./public/videobanners/preview/${newVideobanner.uuid}.webp`);

    await newVideobanner.update({ preview: true });
  }

  return res.status(201).send(newVideobanner);
});

exports.editVideobanner = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const videobanner = await Videobanners.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!videobanner) return next(new AppError("Videobanner not found", 404));

  await videobanner.update(req.body);

  if (req.body.productIds) {
    await Videobannerproducts.destroy({
      where: { videobannerId: videobanner.id },
    });
    for (productId of req.body.productIds) {
      await Videobannerproducts.create({
        productId,
        videobannerId: videobanner.id,
      });
    }
  }

  if (req.body.photo) {
    const photo = decodeBase64Image(req.body.photo);
    await sharp(photo.data)
      .toFormat("webp")
      .webp({ quality: 55 })
      .toFile(`./public/videobanners/preview/${videobanner.uuid}.webp`);

    await videobanner.update({ preview: true });
  }

  return res.status(200).send(videobanner);
});

exports.deleteVideobanner = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const uuid = req.params.uuid;
  const videobanner = await Videobanners.findOne({ where: { uuid } });
  if (!videobanner) return next(new AppError("Videobanner not found", 404));

  if (videobanner.video)
    fs.unlink(`./public/videobanners/video/${uuid}.mp4`, function (err) {
      if (err) throw err;
    });
  if (videobanner.preview)
    fs.unlink(`./public/videobanners/preview/${uuid}.webp`, function (err) {
      if (err) throw err;
    });
  if (videobanner.image)
    fs.unlink(`./public/videobanners/image/${uuid}.webp`, function (err) {
      if (err) throw err;
    });

  await videobanner.destroy();

  return res.status(200).json({ msg: "Successfully Deleted" });
});

exports.deleteFile = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  const uuid = req.params.uuid;
  const videobanner = await Videobanners.findOne({ where: { uuid } });
  if (!videobanner) return next(new AppError("Videobanner not found", 404));

  const { key } = req.query;
  var extension = key == "video" ? "mp4" : "webp";
  if (videobanner.video_isAdded)
    fs.unlink(
      `./public/videobanners/${key}/${uuid}.${extension}`,
      function (err) {
        if (err) throw err;
      }
    );

  await videobanner.update({ [key]: false });

  return res.status(200).json({ msg: "Successfully Deleted" });
});

// Multer Properties For Video
const multerStorage = multer.diskStorage({
  destination: "./public/videobanners/video/",
  filename: (req, file, cb) => {
    cb(null, `${req.params.uuid}.mp4`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new AppError("Not a video! Please upload only videos.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 30000000,
  },
  fileFilter: multerFilter,
});
exports.uploadVideo = upload.single("video");

exports.saveVideo = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (!req.file) return next(new AppError("Please provide Video", 400));
  const uuid = req.params.uuid;
  const videobanner = await Videobanners.findOne({ where: { uuid } });

  if (!videobanner) {
    fs.unlink(`./public/videobanners/video/${uuid}.mp4`, function (err) {
      if (err) throw err;
    });
    return next(new AppError("Videobanner not found", 404));
  }

  await videobanner.update({ video: true });

  return res.status(201).send(videobanner);
});

// Multer Properties For Image
const multerStorage_fi = multer.memoryStorage();

const multerFilter_fi = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload_fi = multer({
  storage: multerStorage_fi,
  fileFilter: multerFilter_fi,
});
exports.uploadPhoto = upload_fi.single("photo");

exports.savePhoto = catchAsync(async (req, res, next) => {
  if (["operator", "stock_operator"].includes(req.user.role))
    return next(new AppError("You cant", 403));

  if (!req.body.photo) return next(new AppError("Please provide Image", 400));

  const uuid = req.params.uuid;
  const videobanner = await Videobanners.findOne({ where: { uuid } });
  if (!videobanner) return next(new AppError("Videobanner not found", 404));

  const photo = decodeBase64Image(req.body.photo);
  await sharp(photo.data)
    .toFormat("webp")
    .webp({ quality: 55 })
    .toFile(`./public/videobanners/image/${uuid}.webp`);

  await videobanner.update({ image: true });

  return res.status(200).send(videobanner);
});
