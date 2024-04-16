import config from "../../../config/index.js";
import { APIError, verifyJSWebToken } from "../../../utils/index.js";
import userService from "../users/user.service.js";
import { roles } from "./auth.service.js";

class AuthMiddleware {
  table = "sessions";

  async verifyAccessToken(req, res, next) {
    try {
      // Bearer accessToken ...
      const Authorization = req.headers.authorization;

      console.log(`Authorization:::`, Authorization);

      if (!Authorization) {
        return next(new APIError(401, "Vui lòng đăng nhập lại!"));
      }

      const accessToken = Authorization.split(" ")[1];

      const decode = await verifyJSWebToken({
        token: accessToken,
        privateKey: config.jwt.privateKeyAccessToken,
      });

      req.user_id = decode.user_id;

      next();
    } catch (error) {
      next(new APIError(error.statusCode || 500, error.message));
    }
  }

  async getUser(req, res, next) {
    try {
      const user_id = req.user_id;
      const response = await userService.getById(user_id);
      const { password, doctor_desc, content_title, ...others } = response;

      req.user = others;
      return next();
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  }

  async verifyByIdIsAdmin(req, res, next) {
    try {
      const user = req.user;
      const id = +req.params.id;

      // console.log("id:::", { id, user });

      if ((id && user.user_id === id) || user.role === roles.ADMIN) {
        return next();
      }

      return next(new APIError(403, "Bạn không có quyền truy cập"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  }

  async verifyRefreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new APIError(401, "Vui lòng đăng nhập lại!"));
      }

      // find Refresh Token to db
      // const [findToken] = await DB.find({
      //   table: this.table,
      //   conditions: { refresh_token: refreshToken },
      // });

      // if (!findToken) {
      //   return next(new APIError(403, "jwt refreshToken hết hạn!"));
      // }

      const decode = await verifyJSWebToken({
        token: refreshToken,
        privateKey: config.jwt.privateKeyRefreshToken,
      });

      req.user_id = decode.user_id;

      next();
    } catch (error) {
      // if (error.message === "jwt expired") {
      //   // delete refresh Token db and send message client sign again.
      //   const refreshToken = req.cookies.refreshToken;

      //   await DB.find({
      //     table: this.table,
      //     conditions: { refresh_token: refreshToken },
      //   });

      //   return next(new APIError(403, "jwt refreshToken hết hạn!"));
      // }

      next(new APIError(error.statusCode || 500, error.message));
    }
  }
}

export default new AuthMiddleware();
