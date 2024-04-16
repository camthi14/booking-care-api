import { DB, pool } from "../../../database/index.js";
import SQLString from "sqlstring";
import _ from "lodash";
import {
  cloudinary,
  APIError,
  deleteKeyObjectNull,
} from "../../../utils/index.js";

export const service_types = {
  BASIC: {
    key: "BASIC",
    value: "cơ bản",
  },
  ADVANCE: {
    key: "ADVANCE",
    value: "Nâng cao",
  },
  MALE: {
    key: "MALE",
    value: "Nam",
  },
  FEMALE: {
    key: "FEMALE",
    value: "Nữ",
  },
  CHILDREN: {
    key: "CHILDREN",
    value: "Trẻ em",
  },
  OLD_PERSON: {
    key: "OLD_PERSON",
    value: "Người già",
  },
};

class UseServiceService {
  table = "services";
  primaryKey = "service_id";

  getAll = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const page = +filters?.page || 1;
        const limit = +filters?.limit || 4;
        const offset = limit * (page - 1);
        const search = filters?.search;
        const field = filters?.field;
        const order = filters?.order;
        const where = filters?.where?.split(",");
        const whereBy =
          where && where?.length ? { key: where[0], value: where[1] } : null;

        let sql = SQLString.format(
          "SELECT s.*, c.clinic_name, c.area FROM services s JOIN clinics c ON s.clinic_id = c.clinic_id LIMIT ? OFFSET ?",
          [limit, offset]
        );

        let qTotalRow = SQLString.format(
          "SELECT count(service_id) as totalRow FROM services WHERE service_id"
        );

        if (!search && order) {
          const orderBy = order.split(",").join(" ");
          sql = SQLString.format(
            "SELECT s.*, c.clinic_name, c.area FROM services s JOIN clinics c ON s.clinic_id = c.clinic_id ORDER BY " +
              orderBy +
              " LIMIT ? OFFSET ? ",
            [limit, offset]
          );
        } else if (search && field && !order) {
          sql = SQLString.format(
            "SELECT s.*, c.clinic_name, c.area FROM services s JOIN clinics c ON s.clinic_id = c.clinic_id WHERE ?? LIKE ? LIMIT ? OFFSET ? ",
            [field, `%${search}%`, limit, offset]
          );
        } else if (search && field && order) {
          const orderBy = order.split(",").join(" ");
          sql = SQLString.format(
            "SELECT s.*, c.clinic_name, c.area FROM services s JOIN clinics c ON s.clinic_id = c.clinic_id WHERE ?? LIKE ? ORDER BY " +
              orderBy +
              " LIMIT ? OFFSET ? ",
            [field, `%${search}%`, limit, offset]
          );
        } else if (whereBy) {
          sql = SQLString.format(
            "SELECT s.*, c.clinic_name, c.area FROM services s JOIN clinics c ON s.clinic_id = c.clinic_id WHERE ??=? LIMIT ? OFFSET ? ",
            [whereBy.key, whereBy.value, limit, offset]
          );
        }

        const [result] = await pool.query(sql);
        const [totalRow] = await pool.query(qTotalRow);
        resolve({
          result,
          pagination: {
            page,
            limit,
            totalPage: Math.ceil(totalRow[0].totalRow / limit),
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  getById = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await DB.find({
          table: this.table,
          conditions: { [this.primaryKey]: id },
        });

        if (!data) {
          return reject(
            new APIError(404, `Không tim thấy trạng thái có id = ${id}`)
          );
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  };

  create = (data = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        // * kiểm tra name có tôn tại hay không.
        const nameExist = await DB.find({
          table: this.table,
          conditions: { service_name: data.service_name },
        });

        if (!_.isEmpty(nameExist)) {
          return reject(
            new APIError(400, `\`${data.service_name}\` was exist!`)
          );
        }

        const id = await DB.create({ table: this.table, data: data });

        resolve(await this.getById(id));
      } catch (error) {
        reject(error);
      }
    });
  };

  update = (id, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let newData = deleteKeyObjectNull(data);

        if (!_.isEmpty(newData.service_img)) {
          try {
            // * Xoá ảnh cloud;
            await cloudinary.uploader.destroy(newData.service_img_name);
          } catch (error) {
            return reject(
              new APIError(
                404,
                `Cannot delete image by name = ${newData.service_img_name}`
              )
            );
          }

          newData = {
            ...newData,
            service_img: newData.service_img.path,
            service_img_name: newData.service_img.filename,
          };
        }

        const response = await DB.update({
          table: this.table,
          data: newData,
          field: this.primaryKey,
          id: +id,
        });

        if (!response) {
          return reject(new APIError(404, `Cannot update data by id = ${id}`));
        }
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  };

  deleteById = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = await this.getById(id);

        if (!_.isEmpty(data.service_img)) {
          await cloudinary.uploader.destroy(data.service_img_name);
        }

        data = await DB.delete({
          table: this.table,
          field: this.primaryKey,
          id: +id,
        });

        if (!data) {
          return reject(new APIError(404, `Cannot delete by id = ${id}`));
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  };

  delete = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await DB.delete({ table: this.table });
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  };

  getFilter = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const area = filters?.area;
        const type = filters?.type;
        const price = filters?.price?.split(",");

        let startPrice = 0;
        let endPrice = 0;
        let character = "";
        let prepare = "";
        let dependency = [];

        if (price?.length > 2) {
          // * compare with bettwen
          startPrice = +price[0];
          character = price[1];
          endPrice = +price[2];
        } else if (price?.length) {
          character = price[0];
          startPrice = price[1];
        }

        if (price?.length) {
          if (endPrice) {
            // * compare with bettwen
            prepare =
              "SELECT s.*, c.area FROM services s JOIN clinics c ON c.area LIKE ? AND s.clinic_id = c.clinic_id WHERE s.`type`=? AND s.service_price BETWEEN ? AND ?";
            dependency = [`%${area}%`, type, startPrice, endPrice];
          } else {
            prepare = `SELECT s.*, c.area FROM services s JOIN clinics c ON c.area LIKE ? AND s.clinic_id = c.clinic_id WHERE s.\`type\`=? AND s.service_price ${character} ?`;
            dependency = [`%${area}%`, type, startPrice];
          }
        } else {
          prepare =
            "SELECT s.*, c.area FROM services s JOIN clinics c ON s.clinic_id = c.clinic_id WHERE s.`type`=?";
          dependency = [type];
        }

        let sql = SQLString.format(prepare, dependency);

        const [result] = await pool.query(sql);

        resolve(result);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  getServiceCount = async () => {
    try {
      let payload = { table: "services" };
      const response = await DB.count(payload);

      return response[0].totalRow;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };
}

export default new UseServiceService();
