const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const errorMiddleware = require("./middleware/error.middleware");
const cookieParser = require("cookie-parser");
const logger = require("./config/logger");
const { dbConnect } = require("./config/dbConnect");

class App {
  express;
  port

  constructor(controllers, port) {
    this.express = express();
    this.port = port;
    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
    this.initializeDatabase();
  }

  initializeDatabase = async () => {
    dbConnect();
  };

  initializeMiddleware = () => {
    this.express.use(
      cors({
        origin: "*",
      })
    );
    this.express.use(compression());
    this.express.use(helmet());
    this.express.use(morgan("common"));
    this.express.use(express.json({ limit: "50mb" }));
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cookieParser());
  };

  initializeControllers = (controllers) => {
    controllers.forEach((controller) => {
      this.express.use("/api/", controller.router);
    });
  };

  initializeErrorHandling = () => {
    this.express.use(errorMiddleware);
  };

  listen = () => {
    this.express.listen(this.port, () => {
      logger.info(`Server listening on PORT ${this.port}`);
    });
  };
}

module.exports = App;
