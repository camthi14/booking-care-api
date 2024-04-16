import config from "../../../config/index.js";
import { APIError } from "../../../utils/index.js";
import VNPayService from "./vnpay.service.js";

class VNPayController {
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  createPaymentUrl = async (req, res, next) => {
    try {
      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      const { amount, bankCode } = req.body;

      if (!amount) {
        return next(new APIError(404, "Missing amount!"));
      }

      const response = await VNPayService.handleCreatePaymentUrl({
        ipAddr,
        amount,
        bankCode,
        user_id: req.body.user_id,
      });

      return res.send(response.vnpUrl);
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  vnpayReturn = async (req, res, next) => {
    try {
      const URL_REDIRECT_RETURN = `${config.app.clientURL}/thanh-cong`;
      const vnpParams = req.query;
      const response = await VNPayService.handleVnpayReturn({ vnpParams });

      res.cookie("vnp_return", response.code);
      return res.redirect(URL_REDIRECT_RETURN);
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  vnpayRefund = async (req, res, next) => {
    try {
      let vnp_IpAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      const body = req.body;
      const response = await VNPayService.handleVnpayRefund({
        ...body,
        vnp_IpAddr,
      });

      return res.json(response);
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

// console.log(`${config.app.clientURL}/retrun`);

export default new VNPayController();
