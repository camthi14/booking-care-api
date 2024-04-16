import _ from "lodash";
import SQLString from "sqlstring";
import { DB, pool } from "../../../database/index.js";
import {
  APIError,
  cloudinary,
  deleteKeyObjectNull,
} from "../../../utils/index.js";
import userService from "../users/user.service.js";

class SpecialtyService {
  table = "specialties";
  primaryKey = "specialty_id";

  getAll = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const page = +filters?.page || 1;
        const limit = +filters?.limit || 4;
        const offset = limit * (page - 1);

        const data = await DB.findAll({
          table: this.table,
          filters: { ...filters, page, limit, offset },
        });
        const totalRow = await DB.count({ table: this.table });
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
        const specialty = await DB.find({
          table: this.table,
          conditions: { [this.primaryKey]: id },
        });

        const sql = SQLString.format(
          "SELECT * FROM `users` WHERE `specialty_id`=?",
          [id]
        );

        const [doctors] = await pool.query(sql);

        let schedules = [];

        if (doctors?.length) {
          schedules = await Promise.all(
            doctors.map((doctor) => userService.getDoctorById(doctor.user_id))
          );
        }

        resolve({
          ...specialty,
          schedules,
        });
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
          conditions: { specialty_name: data.specialty_name },
        });

        if (!_.isEmpty(nameExist)) {
          return reject(
            new APIError(400, `\`${data.specialty_name}\` was exist!`)
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

        if (!_.isEmpty(newData.specialty_img)) {
          try {
            // * Xoá ảnh cloud;
            await cloudinary.uploader.destroy(newData.specialty_img_name);
          } catch (error) {
            return reject(
              new APIError(
                404,
                `Cannot delete image by name = ${newData.specialty_img_name}`
              )
            );
          }

          newData = {
            ...newData,
            specialty_img: newData.specialty_img.path,
            specialty_img_name: newData.specialty_img.filename,
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

        if (!_.isEmpty(data.specialty_img)) {
          await cloudinary.uploader.destroy(data.specialty_img_name);
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
}

export default new SpecialtyService();
