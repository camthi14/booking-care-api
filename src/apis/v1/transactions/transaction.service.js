import SqlString from "sqlstring";

import { APIError } from "../../../utils/index.js";
import DB from "../../../database/db.js";

const statuses = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
};

class TransactionService {
  static create({ bill_id, order_id, amount, status = statuses.PENDING }) {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * 1. Kiểm tra bill có tồn tại chưa.
         * 2. Nếu tồn tại thì return
         * 3. Nếu không tồn tại thì tạo.
         */

        // * 1
        const findTransaction = await DB.find({
          table: "transactions",
          conditions: {
            bill_id,
          },
        });

        // * 2
        if (findTransaction) {
          return reject(
            new APIError(409, `Giao dịch đã tồn tại với bill id = ${bill_id}`)
          );
        }

        // * 3
        await DB.create({
          table: "transactions",
          data: {
            bill_id,
            order_id,
            amount,
            status,
          },
        });

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async update({
    transactionId,
    bankCode,
    payDate,
    responseCode,
    orderId,
    status = statuses.SUCCESS,
  }) {
    try {
      const response = await DB.update({
        table: "transactions",
        data: {
          transaction_id: transactionId,
          bank_code: bankCode,
          pay_date: payDate,
          response_code: responseCode,
          status,
        },
        id: orderId,
        field: "order_id",
      });

      if (!response) {
        throw new APIError(404, "Giao dịch không tồn tại!");
      }

      return true;
    } catch (error) {
      throw new APIError(500, error.message);
    }
  }
}

export default TransactionService;
