const express = require("express");
const cors = require("cors");
const AppError = require("./utils/appError");
const app = express();

var whitelist = [
  "https://admin.salam.com.tm",
  "https://salam.com.tm",
  "https://www.salam.com.tm",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (typeof origin === "undefined" || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(require("helmet")());
const limiter = require("express-rate-limit")({
  max: 1000,
  windowMs: 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use(require("morgan")("dev"));
app.use(require("cookie-parser")());
app.use("/", limiter);
app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ limit: "35mb", extended: true }));
app.use(require("xss-clean")());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/admin", require("./routes/admin/adminRouter"));
app.use(cors(corsOptions));
app.use("/api/v1/public", require("./routes/public/publicRouter"));
app.use("/api/v1/users", require("./routes/users/usersRouter"));
app.use("/api/v1/carriers", require("./routes/carriers/carriersRouter"));
app.use("/api/v1/suppliers", require("./routes/suppliers/suppliersRouter"));
app.use(
  "/api/v1/wholesalers",
  require("./routes/wholesalers/wholesalersRouter")
);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(require("./controllers/errorController"));

setInterval(() => {
  require("./utils/timeset_scripts").timeset_scripts();
}, 5000);

module.exports = app;
