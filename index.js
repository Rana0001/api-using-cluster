const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const os = require("os");
const cluster = require("cluster");
require("colors");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth-route");
const userRouter = require("./routes/user-route");
const morgan = require("morgan");
const express = require("express");

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const app = express();

  app.use(cors());
  app.use(morgan("dev"));

  connectDB();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static("public"));

  app.use(process.env.Base_End_Point, userRouter);
  app.use(process.env.Base_End_Point, authRouter);

  app.get(`${process.env.Base_End_Point}/`, (req, res) => {
    let total = 0;
    for (let i = 0; i < 1e6; i++) {
      total += i;
    }
    res.send(`Total is ${total}`);
  });



  app.listen(process.env.PORT, () => {
    console.log(`Server running on port: ` + `${process.env.PORT}`.green.bold);
    console.log(`Worker ${process.pid} started`);
  });

  app.use((err, req, res, next) => {
    if (res.statusCode == 200) res.status(500);
    console.log(err);
    res.status(500).json({ msg: err.messge });
  });
}
