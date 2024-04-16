import { APIError } from "../utils/index.js";

function ErrorHandleMiddleWare(app) {
  //handle 404 response
  app.use((req, res, next) => {
    return next(new APIError(404, "Url not found!"));
  });

  //define handle error middleware last, after other app.use() and routes calls
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error!";
    return res.status(statusCode).json({
      message,
      status: "Error",
    });
  });
}

export default ErrorHandleMiddleWare;
