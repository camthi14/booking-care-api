import config from "../../../config/index.js";
import { DB } from "../../../database/index.js";
import {
  APIError,
  comparePassword,
  generateToken,
  hashPassword,
  resetPassword,
  signJSWebToken,
} from "../../../utils/index.js";
import emailService from "../emails/email.service.js";

export const roles = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  CUSTOMER: "CUSTOMER",
  CLINIC: "CLINIC",
};

class AuthService {
  table = "users";
  primaryKey = "user_id";

  signIn = async ({ email, password }) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Find email
        const result = await DB.find({
          table: this.table,
          conditions: { email: email },
        });

        if (!result) {
          return reject(new APIError(400, "Sai tài khoản hoặc mật khẩu."));
        }

        const {
          password: passwordHash,
          user_id,
          role,
          ...others
        } = { ...result };

        // so sánh  password với password trên database
        const isValidPwd = await comparePassword(password, passwordHash);

        if (!isValidPwd) {
          return reject(
            new APIError(400, "Mật khẩu không đúng. Vui lòng nhập lại.")
          );
        }

        //Tạo accessToken and refreshToken
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

        // resolve accessToken and refreshToken to authController
        return resolve({
          accessToken,
          refreshToken,
          isHome: role === roles.CUSTOMER,
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  forgotPassword = async ({ email, phone }) => {
    try {
      const user = await this.handleCheckEmailAndPhone({ email, phone });

      const tokenExist = await DB.find({
        table: "tokens",
        conditions: {
          user_id: user.user_id,
        },
      });

      if (tokenExist) {
        throw new APIError(409, `Token đã tồn tại!`);
      }

      const token = generateToken();

      const hashToken = await hashPassword(token);

      await DB.create({
        data: {
          user_id: user.user_id,
          token: hashToken,
        },
        table: "tokens",
      });

      const urlRedirect = `${process.env.URL_CLIENT}/quen-mat-khau?user_id=${user.user_id}&token=${token}`;

      try {
        await emailService.sendEmail({
          email: email,
          html: resetPassword({
            lastName: `${user.last_name} ${user.first_name}`,
            REDIRECT_URL: urlRedirect,
          }),
          subject: "[QUÊN MẬT KHẨU]",
        });
      } catch (error) {
        if (user) {
          await DB.delete({
            table: "tokens",
            field: "user_id",
            id: user.user_id,
          });
        }

        throw new APIError(500, "Send Email Failed!");
      }
    } catch (error) {
      console.log("error forgotPassword:::", error);
      throw new APIError(error.statusCode || 500, error.message);
    }
  };

  handleCheckEmailAndPhone = async ({ email, phone }) => {
    try {
      const userAccount = await DB.find({
        table: "users",
        conditions: { phone },
      });

      if (!userAccount) {
        throw new APIError(404, `Số điện thoại phải là số đã đăng ký!`);
      }

      await emailService.validationEmail(email, `E-mail ${email} không hợp lệ`);

      return userAccount;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };

  changePassword = async ({ userId, token, password }) => {
    try {
      const findToken = await DB.find({
        table: "tokens",
        conditions: {
          user_id: userId,
        },
      });

      if (!findToken) {
        throw new APIError(404, `Token \`${token}\` không tồn tại!`);
      }

      const compareToken = await comparePassword(token, findToken.token);

      if (!compareToken) {
        throw new APIError(404, `Token \`${token}\` không hợp lệ!`);
      }

      const passwordNew = await hashPassword(password);

      await DB.update({
        data: {
          password: passwordNew,
        },
        table: "users",
        field: "user_id",
        id: userId,
      });

      await DB.delete({
        table: "tokens",
        field: "user_id",
        id: userId,
      });

      return true;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };
}

export default new AuthService();
