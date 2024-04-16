import _ from "lodash";
import SQLString from "sqlstring";
import { DB, pool } from "../../../database/index.js";
import {
  APIError,
  cloudinary,
  deleteKeyObjectNull,
} from "../../../utils/index.js";
import userService from "../users/user.service.js";

class ClinicService {
  table = "clinics";
  primaryKey = "clinic_id";

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
        const clinic = await DB.find({
          table: this.table,
          conditions: { [this.primaryKey]: id },
        });
        const sql = SQLString.format(
          "SELECT * FROM `users` WHERE `clinic_id`=?",
          [id]
        );

        const [doctors] = await pool.query(sql);

        let schedules = [];

        if (doctors?.length) {
          schedules = await Promise.all(
            doctors.map((doctor) => userService.getDoctorById(doctor.user_id))
          );
        }

        const specialties = await DB.getAll({
          table: "clinic_specialty",
          conditions: { clinic_id: id },
        });

        resolve({
          ...clinic,
          specialties: specialties?.length
            ? specialties.map((i) => i.specialty_id)
            : [],
          schedules,
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  getAllSpecialtyClinic = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = SQLString.format(
          "SELECT s.* FROM `clinic_specialty` cs JOIN specialties s ON cs.clinic_id = ? && s.specialty_id = cs.specialty_id;",
          [id]
        );

        const [result] = await pool.query(sql);

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  create = (data = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { specialties, ...otherData } = data;

        // * kiểm tra name có tôn tại hay không.
        const nameExist = await DB.find({
          table: this.table,
          conditions: { clinic_name: data.clinic_name },
        });

        if (!_.isEmpty(nameExist)) {
          return reject(
            new APIError(400, `\`${data.clinic_name}\` was exist!`)
          );
        }

        const id = await DB.create({ table: this.table, data: otherData });

        await this.createSpecialties(specialties, id);

        resolve(await this.getById(id));
      } catch (error) {
        reject(error);
      }
    });
  };

  createSpecialties = async (data, clinic_id) => {
    try {
      let specialtyInsertBulk = data ? JSON.parse(data) : [];

      specialtyInsertBulk = specialtyInsertBulk.map((i) => [+clinic_id, i]);
      // * [ [8,28], [8, 30] ]

      await DB.createBulk({
        data: specialtyInsertBulk,
        fields: ["clinic_id", "specialty_id"],
        table: "clinic_specialty",
      });

      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  update = (id, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let newData = deleteKeyObjectNull(data);

        if (!_.isEmpty(newData.clinic_img)) {
          try {
            // * Xoá ảnh cloud;
            await cloudinary.uploader.destroy(newData.clinic_img_name);
          } catch (error) {
            return reject(
              new APIError(
                404,
                `Cannot delete image by name = ${newData.clinic_img_name}`
              )
            );
          }

          newData = {
            ...newData,
            clinic_img: newData.clinic_img.path,
            clinic_img_name: newData.clinic_img.filename,
          };
        }

        await DB.delete({
          table: "clinic_specialty",
          field: "clinic_id",
          id: id,
        });

        await this.createSpecialties(data.specialties, id);

        const { specialties, ...otherData } = newData;

        const response = await DB.update({
          table: this.table,
          data: otherData,
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
        /**
         * Gửi id lên server
         * GetById lấy đường dẫn ảnh từ database để xoá vì ảnh lưu trên cloud
         * Xoá id đó
         */
        let data = await this.getById(id);

        if (!_.isEmpty(data.clinic_img)) {
          await cloudinary.uploader.destroy(data.clinic_img_name);
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

  getClinicCount = async () => {
    try {
      let payload = { table: "clinics" };

      const response = await DB.count(payload);

      return response[0].totalRow;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };
}

export default new ClinicService();
