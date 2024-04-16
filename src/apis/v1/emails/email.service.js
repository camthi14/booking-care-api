import { validate } from "deep-email-validator";
import _ from "lodash";
import nodemailer from "nodemailer";
import { APIError } from "../../../utils/index.js";

class EmailService {
  sendEmail = ({ email, html, subject = "Quên mật khẩu ✔" }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          service: "gmail",
          port: 587,
          auth: {
            user: process.env.EMAIL_APP_USERNAME,
            pass: process.env.EMAIL_APP_PASSWORD,
          },
        });

        let info = await transporter.sendMail({
          from: '"Manager Booking Care" <cooltehinguyen1004@gmail.com>', // sender address
          to: email, // list of receivers
          subject: subject, // Subject line
          html: html, // html body
        });

        if (!_.isEmpty(info)) {
          resolve(true);
        }
      } catch (error) {
        console.log("error sendEmail:::", error);
        reject(error);
      }
    });
  };

  validationEmail = async (
    email,
    message = "Vui lòng cung cấp một địa chỉ email hợp lệ!"
  ) => {
    try {
      const response = await validate(email);

      const { valid, reason, validators } = response;

      // if(!valid && reason && !validators[reason].valid && validators[reason].reason === "Timeout.") {
      // return true;
      // }

      if (!valid && reason && !validators[reason].valid) {
        throw new APIError(400, message);
      }

      return valid;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };
}

export default new EmailService();
