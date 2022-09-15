require("dotenv").config({ path: "./config/config.env" });
const { sequelize } = require("./models");

const server = require("./app").listen(process.env.PORT, async () => {
  await sequelize.authenticate();
  console.log(`Connected to DB and listening on port ${process.env.PORT}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
