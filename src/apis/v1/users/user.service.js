import _ from "lodash";
import { DB, pool } from "../../../database/index.js";
import {
  APIError,
  cloudinary,
  deleteKeyObjectNull,
  hashPassword,
} from "../../../utils/index.js";
import SQLString from "sqlstring";
import { roles } from "../auth/auth.service.js";

class UserService {
  table = "users";
  primaryKey = "user_id";

  getAll = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const page = +filters?.page || 1;
        const limit = +filters?.limit || 4;
        const offset = limit * (page - 1);
        const where = filters?.where?.split(",");
        const whereBy =
          where && where?.length ? { key: where[0], value: where[1] } : null;

        const data = await DB.findAll({
          table: this.table,
          filters: { ...filters, page, limit, offset, whereBy },
        });

        const totalRow = await DB.count({ table: this.table, whereBy });

        resolve({
          result: data,
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
        const password = await hashPassword(data.password);

        // * kiểm tra email có tôn tại hay không.
        await this.handleCheckEmailAndPhoneExist(data.email, data.phone);

        const id = await DB.create({
          table: this.table,
          data: { ...data, password },
        });

        resolve(await this.getById(id));
      } catch (error) {
        reject(error);
      }
    });
  };

  handleCheckEmailAndPhoneExist = async (email, phone) => {
    try {
      const emailExist = await DB.find({
        table: this.table,
        conditions: { email: email },
      });

      if (!_.isEmpty(emailExist)) {
        throw new APIError(400, `Email \`${email}\` đã tồn tại !`);
      }

      const phoneExist = await DB.find({
        table: this.table,
        conditions: { phone: phone },
      });

      if (!_.isEmpty(phoneExist)) {
        throw new APIError(400, `Số điện thoại \`${phone}\` đã tồn tại !`);
      }

      return true;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };

  update = (id, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * input: id, data.
         *
         * ---------------------------------
         * * - Kt name trùng:
         * + select name => response. {}.
         * + if(response && response.your_primary_key !== id) => name trừng với thăng khác
         * + ngược lại nó la chính nó
         * * Thi cập nhật binh thường
         * ----------------------------------
         *
         * ----------------------------------
         * * Cập nhật ảnh nếu có ảnh mới.
         * - input:
         * + file_name_avatar
         *
         * => Xoá ảnh trên cloundinary bằng file_name_avatar.
         * Cập nhật lại trên database
         * + file_name_avatar: file.filename
         * + avatar: file.path
         * -------------------------------------
         */

        let newData = deleteKeyObjectNull(data);

        if (newData.password) {
          const password_new = await this.hashPassword(newData.password);
          newData = {
            ...newData,
            password: password_new,
          };
        }

        if (!_.isEmpty(newData.avatar)) {
          try {
            // * Xoá ảnh cloud;
            await cloudinary.uploader.destroy(newData.file_name_avatar);
          } catch (error) {
            return reject(
              new APIError(
                404,
                `Cannot delete image by name = ${newData.file_name_avatar}`
              )
            );
          }
          newData = {
            ...newData,
            avatar: newData.avatar.path,
            file_name_avatar: newData.avatar.filename,
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

        if (!_.isEmpty(data.avatar)) {
          await cloudinary.uploader.destroy(data.file_name_avatar);
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

  getDoctor = (filters = {}) => {
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
          "SELECT u.*, c.clinic_name, s.specialty_name FROM users u JOIN clinics c ON u.clinic_id = c.clinic_id JOIN specialties s ON u.specialty_id = s.specialty_id LIMIT ? OFFSET ?",
          [limit, offset]
        );

        let qTotalRow = SQLString.format(
          "SELECT count(role) as totalRow FROM users WHERE role = ?",
          [roles.DOCTOR]
        );

        if (whereBy) {
          qTotalRow = SQLString.format(
            "SELECT count(role) as totalRow FROM users WHERE role = ? AND ??=?",
            [roles.DOCTOR, whereBy.key, whereBy.value]
          );
        }

        if (!search && order) {
          const orderBy = order.split(",").join(" ");
          sql = SQLString.format(
            "SELECT u.*, c.clinic_name, s.specialty_name FROM users u JOIN clinics c ON u.clinic_id = c.clinic_id JOIN specialties s ON u.specialty_id = s.specialty_id ORDER BY " +
              orderBy +
              " LIMIT ? OFFSET ? ",
            [limit, offset]
          );
        } else if (search && field && !order) {
          sql = SQLString.format(
            "SELECT u.*, c.clinic_name, s.specialty_name FROM users u JOIN clinics c ON u.clinic_id = c.clinic_id JOIN specialties s ON u.specialty_id = s.specialty_id WHERE ?? LIKE ? LIMIT ? OFFSET ? ",
            [field, `%${search}%`, limit, offset]
          );
        } else if (search && field && order) {
          const orderBy = order.split(",").join(" ");
          sql = SQLString.format(
            "SELECT u.*, c.clinic_name, s.specialty_name FROM users u JOIN clinics c ON u.clinic_id = c.clinic_id JOIN specialties s ON u.specialty_id = s.specialty_id WHERE ?? LIKE ? ORDER BY " +
              orderBy +
              " LIMIT ? OFFSET ? ",
            [field, `%${search}%`, limit, offset]
          );
        } else if (whereBy) {
          sql = SQLString.format(
            "SELECT u.*, c.clinic_name, s.specialty_name FROM users u JOIN clinics c ON u.clinic_id = c.clinic_id JOIN specialties s ON u.specialty_id = s.specialty_id WHERE ??=? LIMIT ? OFFSET ? ",
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

  getDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        /**
         * 1 - Doctor <-> N - lich
         * result = 3; ma lay 1 thang
         */

        const doctor = SQLString.format(
          "SELECT u.*, c.clinic_name, c.clinic_address, area, s.specialty_name FROM users u JOIN clinics c ON u.clinic_id = c.clinic_id JOIN specialties s ON u.specialty_id = s.specialty_id  WHERE ??=?",
          [this.primaryKey, id]
        );

        const sql = SQLString.format(
          "SELECT * FROM `schedules` WHERE `doctor_id`=?",
          [id]
        );

        const [result1] = await pool.query(doctor);
        const [result2] = await pool.query(sql);

        let data = [...result2];
        data = data.map((e) => ({
          ...e,
          works: JSON.parse(e.works),
        }));

        resolve({ ...result1[0], schedules: data });
      } catch (error) {
        reject(error);
      }
    });
  };

  getUserCount = async (role = "") => {
    try {
      let payload = { table: "users" };

      if (role) {
        payload = {
          ...payload,
          whereBy: {
            key: "role",
            value: role,
          },
        };
      }

      const response = await DB.count(payload);

      return response[0].totalRow;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };
}

export default new UserService();
