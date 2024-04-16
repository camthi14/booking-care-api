import { APIError, generateOrderId, responseAPI } from "../../../utils/index.js";
import TransactionService from "../transactions/transaction.service.js";
import VNPayService from "../vnpay/vnpay.service.js";
import bookingService from "./booking.service.js";

class BookingController {
  getAll = async (req, res, next) => {
    try {
      const user = req.user;
      const filters = req.query;

      const response = await bookingService.getAll({
        ...filters,
      });

      return res.status(200).json(responseAPI(response, "Get all booking success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await bookingService.getById(id);

      return res.status(200).json(responseAPI(response, `Get by ${id} booking success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  create = async (req, res, next) => {
    const body = req.body;

    // console.log("booking => ", body);

    try {
      if (!body.reason_exam || !body.doctor_id || !body.work_id) {
        return next(new APIError(404, "Missing reason_exam doctor_id work_id "));
      }

      const response = await bookingService.create({ ...body });

      if (body.payments === "offline") {
        return res.status(201).json(responseAPI(response, "Create success!"));
      } else {
        const orderId = generateOrderId();

        await TransactionService.create({
          bill_id: response,
          amount: body.price,
          order_id: orderId,
        });

        const ipAddr =
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;

        const url = await VNPayService.handleCreatePaymentUrl({
          ipAddr,
          amount: body.price,
          bankCode: "",
          orderId: orderId,
        });

        // console.log("url vnpay:::", url);

        return res.status(200).json(responseAPI(url, "Create url payment vn pay success!"));
      }
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  deleteById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await bookingService.deleteById(id);

      return res.status(200).json(responseAPI(response, `Delete by ${id} booking success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await bookingService.delete();

      return res.status(200).json(responseAPI(response, "Delete booking success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  transferStatus = async (req, res, next) => {
    try {
      const response = await bookingService.transferStatus(req.params.id, req.body.status);

      return res.status(200).json(responseAPI(response, "Transfer status success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getBookingCount = async (req, res, next) => {
    try {
      const response = await bookingService.getBookingCount(req.query.status);

      return res.status(200).json(responseAPI(response, "Get count status booking success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new BookingController();
