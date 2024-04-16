import config from "../../../config/index.js";
import { APIError, responseAPI, signJSWebToken } from "../../../utils/index.js";
import emailService from "../emails/email.service.js";
import { UserService } from "../users/index.js";
import authService from "./auth.service.js";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "production" ? false : true,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 3.154e10, // 1 year
};

class AuthController {
  signIn = async (req, res, next) => {
    try {
      const body = req.body;

      if (!body.email || !body.password) {
        return next(new APIError(400, "Missing email or password"));
      }

      const response = await authService.signIn({
        ...body,
        email: body.email,
        password: body.password,
      });

      const { accessToken, refreshToken, isHome } = response;

      return res
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json({ accessToken, isHome });
    } catch (error) {
      next(new APIError(error.statusCode || 500, error.message));
    }
  };

  signUp = async (req, res, next) => {
    const data = req.body;

    try {
      if (
        !data.first_name ||
        !data.last_name ||
        !data.email ||
        !data.password ||
        !data.phone ||
        !data.address
      ) {
        return next(
          new APIError(
            400,
            "Missing first_name last_name email password phone address"
          )
        );
      }

      const response = await UserService.create(data);

      return res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getCurrentAccount = async (req, res, next) => {
    try {
      const user_id = req.user_id;
      const response = await UserService.getById(user_id);
      const { password, ...others } = response;

      return res
        .status(200)
        .json(
          responseAPI(
            others,
            "Lấy giá trị hiện tại của tài khoản người dùng thành công!"
          )
        );
    } catch (error) {
      next(new APIError(error.statusCode || 500, error.message));
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const user_id = req.user_id;

      //Tạo accessToken và refreshToken
      const accessToken = signJSWebToken({
        privateKey: config.jwt.privateKeyAccessToken,
        data: { user: { user_id } },
        options: { expiresIn: config.jwt.expiredAccessToken },
      });

      const refreshToken = signJSWebToken({
        privateKey: config.jwt.privateKeyRefreshToken,
        data: { user: { user_id } },
        options: { expiresIn: config.jwt.expiredRefreshToken },
      });

      //setCookies refreshToken và response client
      return res
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json(
          responseAPI(
            { accessToken },
            "Lấy giá trị mới của accessToken thành công!"
          )
        );
    } catch (error) {
      next(new APIError(error.statusCode || 500, error.message));
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      // * Email: send email, phone: phone register account
      const { email, phone } = req.body;

      if (!email || !phone) {
        return next(new APIError(404, "Missing email or phone!"));
      }

      const response = await authService.forgotPassword({ email, phone });

      return res.status(200).json(responseAPI(response, "Send email success"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns
   */
  signOut = async (req, res, next) => {
    try {
      return res
        .clearCookie("refreshToken")
        .status(200)
        .json({ message: "Đăng xuất thành công!" });
    } catch (error) {
      next(new APIError(error.statusCode || 500, error.message));
    }
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns
   */
  changePasswordForgot = async (req, res, next) => {
    try {
      const response = await authService.changePassword({
        userId: req.body.userId,
        token: req.body.token,
        password: req.body.password,
      });

      return res
        .status(200)
        .json(responseAPI(response, "Change password success."));
    } catch (error) {
      next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new AuthController();
