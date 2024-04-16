import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import ErrorHandleMiddleWare from "./middlewares/error_handle_middleware.js";
import router from "./routes/index.js";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.URL_CLIENT,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + "/assets/upload"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// init router
app.use(router);

//handle error middleware
ErrorHandleMiddleWare(app);

export default app;
