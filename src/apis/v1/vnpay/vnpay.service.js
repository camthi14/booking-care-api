import crypto from "crypto";
import dateFormat from "dateformat";
import queryString from "qs";
import SQLString from "sqlstring";
import config from "../../../config/index.js";
import APIError from "../../../utils/api-error.util.js";
import { sortObject } from "../../../utils/functions.js";
import axios from "axios";
import TransactionService from "../transactions/transaction.service.js";
import DB from "../../../database/db.js";
import pool from "../../../database/init.mysql.js";
import bookingService from "../bookings/booking.service.js";

class VNPayService {
  static handleCreatePaymentUrl = async ({
    ipAddr,
    amount,
    bankCode,
    orderId,
  }) => {
    try {
      const date = new Date();
      const createDate = dateFormat(date, "yyyymmddHHmmss");

      const location = config.location; // vn
      const currCode = config.vnp.currCode; // VND

      const tmnCode = config.vnp.vnp_TmnCode;
      const secretKey = config.vnp.vnp_HashSecret;
      const returnUrl = config.vnp.vnp_ReturnUrl;

      let vnpUrl = config.vnp.vnp_Url;
      let vnpParams = {};

      vnpParams["vnp_Version"] = "2.1.0";
      vnpParams["vnp_Command"] = "pay";
      vnpParams["vnp_TmnCode"] = tmnCode;
      vnpParams["vnp_Locale"] = location;
      vnpParams["vnp_CurrCode"] = currCode;
      vnpParams["vnp_TxnRef"] = orderId;
      vnpParams["vnp_OrderInfo"] =
        "Thanh toán đặt lịch khám bệnh. Mã giao dịch: " + orderId;
      vnpParams["vnp_OrderType"] = "other";
      vnpParams["vnp_Amount"] = amount * 100;
      vnpParams["vnp_ReturnUrl"] = returnUrl;
      vnpParams["vnp_IpAddr"] = ipAddr;
      vnpParams["vnp_CreateDate"] = createDate;

      if (bankCode !== null && bankCode !== "") {
        vnpParams["vnp_BankCode"] = bankCode;
      }

      vnpParams = sortObject(vnpParams);

      const signData = queryString.stringify(vnpParams, { encode: false });

      const hmac = crypto.createHmac("sha512", secretKey);

      const signed = hmac
        .update(new Buffer.from(signData, "utf-8"))
        .digest("hex");

      vnpParams["vnp_SecureHash"] = signed;

      vnpUrl += "?" + queryString.stringify(vnpParams, { encode: false });

      // console.log("handleCreatePaymentUrl url => ", vnpUrl);

      return vnpUrl;
    } catch (error) {
      throw new APIError(500, error.message);
    }
  };

  static handleVnpayReturn = async ({ vnpParams }) => {
    try {
      let _vnpParams = { ...vnpParams };
      const secureHash = _vnpParams["vnp_SecureHash"];

      delete _vnpParams["vnp_SecureHash"];
      delete _vnpParams["vnp_SecureHashType"];

      _vnpParams = sortObject(_vnpParams);

      const secretKey = config.vnp.vnp_HashSecret;

      const signData = queryString.stringify(_vnpParams, { encode: false });

      const hmac = crypto.createHmac("sha512", secretKey);

      const signed = hmac
        .update(new Buffer.from(signData, "utf-8"))
        .digest("hex");

      if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        const findTransaction = await DB.find({
          table: "transactions",
          conditions: {
            order_id: _vnpParams["vnp_TxnRef"],
          },
        });

        if (!findTransaction) {
          throw new APIError(404, "Giao dịch không xác định được.");
        }

        await DB.update({
          table: "bookings",
          data: {
            status: "paid",
          },
          id: findTransaction.bill_id,
          field: "booking_id",
        });

        const bill = await DB.find({
          table: "bookings",
          conditions: {
            booking_id: findTransaction.bill_id,
          },
        });

        if (!bill) {
          throw new APIError(
            404,
            "Không tìm thấy hoá đơn " + findTransaction.bill_id
          );
        }

        const work = await DB.find({
          table: "works",
          conditions: {
            work_id: bill.work_id,
          },
        });

        const sql = SQLString.format(
          "SELECT CONCAT(u.first_name, ' ', u.last_name) AS doctor_name, c.clinic_name, s.specialty_name FROM `users` u JOIN clinics c ON u.user_id = ? AND u.clinic_id=c.clinic_id JOIN specialties s ON u.specialty_id=s.specialty_id;",
          [bill.doctor_id]
        );

        const [result] = await pool.query(sql);

        await bookingService.sendEmailBookingSuccess({
          id: bill.booking_id,
          data: bill,
          userInfo: result[0],
          workInfo: work,
        });

        await TransactionService.update({
          bankCode: _vnpParams["vnp_BankCode"],
          orderId: _vnpParams["vnp_TxnRef"],
          payDate: _vnpParams["vnp_PayDate"],
          responseCode: _vnpParams["vnp_ResponseCode"],
          transactionId: _vnpParams["vnp_TransactionNo"],
        });

        return { code: _vnpParams["vnp_ResponseCode"] };
      } else {
        return { code: "97" };
      }
    } catch (error) {
      Promise.reject(error);
    }
  };

  static handleVnpayRefund = async (data) => {
    try {
      const date = new Date();

      let vnp_TmnCode = config.vnp.vnp_TmnCode;
      let secretKey = config.vnp.vnp_HashSecret;
      let vnp_Api = config.vnp.vnp_Api;

      let vnp_TxnRef = data.orderId;
      let vnp_TransactionDate = data.transDate;
      let vnp_Amount = data.amount * 100;
      let vnp_TransactionType = "02"; // Giao dịch hoàn trả toàn phần.
      let vnp_CreateBy = data.user; //

      let currCode = "VND";

      let vnp_RequestId = dateFormat(date, "HHmmss");
      let vnp_Version = "2.1.0";
      let vnp_Command = "refund";
      let vnp_OrderInfo = "Hoan tien GD ma:" + vnp_TxnRef;

      let vnp_CreateDate = dateFormat(date, "yyyymmddHHmmss");

      let vnp_TransactionNo = data.transactionId;

      let newData =
        vnp_RequestId +
        "|" +
        vnp_Version +
        "|" +
        vnp_Command +
        "|" +
        vnp_TmnCode +
        "|" +
        vnp_TransactionType +
        "|" +
        vnp_TxnRef +
        "|" +
        vnp_Amount +
        "|" +
        vnp_TransactionNo +
        "|" +
        vnp_TransactionDate +
        "|" +
        vnp_CreateBy +
        "|" +
        vnp_CreateDate +
        "|" +
        data.vnp_IpAddr +
        "|" +
        vnp_OrderInfo;

      let hmac = crypto.createHmac("sha512", secretKey);
      let vnp_SecureHash = hmac
        .update(new Buffer.from(newData, "utf-8"))
        .digest("hex");

      let dataObj = {
        vnp_RequestId: vnp_RequestId,
        vnp_Version: vnp_Version,
        vnp_Command: vnp_Command,
        vnp_TmnCode: vnp_TmnCode,
        vnp_TransactionType: vnp_TransactionType,
        vnp_TxnRef: vnp_TxnRef,
        vnp_Amount: vnp_Amount,
        vnp_TransactionNo: vnp_TransactionNo,
        vnp_CreateBy: vnp_CreateBy,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_TransactionDate: vnp_TransactionDate,
        vnp_CreateDate: vnp_CreateDate,
        vnp_IpAddr: data.vnp_IpAddr,
        vnp_SecureHash: vnp_SecureHash,
      };

      const response = await axios.post(vnp_Api, dataObj, {
        headers: {
          "Content-Type": "Application/json",
        },
      });

      await DB.update({
        table: "transactions",
        data: {
          vnp_response_code_refund: response.data.vnp_ResponseCode,
          vnp_command: vnp_Command,
          vnp_message_refund: response.data.vnp_Message,
        },
        id: data.orderId,
        field: "order_id",
      });

      // console.log("response :::", response.data);

      if (response.data && response.data.vnp_ResponseCode === "00") {
        return response.data.vnp_Message;
      } else {
        throw new APIError(
          400,
          `Response code: ${response.data.vnp_ResponseCode} - Message: ${response.data.vnp_Message}`
        );
      }
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };
}

export default VNPayService;
