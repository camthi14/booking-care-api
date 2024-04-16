import _ from "lodash";
import SQLString from "sqlstring";
import { DB, pool } from "../../../database/index.js";
import { APIError } from "../../../utils/index.js";

class ScheduleService {
  table = "schedules";
  primaryKey = "schedule_id";

  getAll = (filters) => {
    return new Promise(async (resolve, reject) => {
      try {
        let works = JSON.parse(filters.works) || [];

        let query = [];

        if (works?.length) {
          query = works.map((work) => `${work.year}-${work.month}-${work.day}`);
        }

        const findAllClinic = await DB.findAll({
          table: "clinics",
          filters: { limit: 50, offset: 0 },
        });

        let findAllSpecialty = null;

        if (findAllClinic?.length) {
          findAllSpecialty = await Promise.all(
            findAllClinic.map(async (clinic) => {
              const sql = SQLString.format(
                "SELECT s.specialty_id, s.specialty_name FROM clinic_specialty cs JOIN specialties s ON cs.clinic_id = ? && cs.specialty_id = s.specialty_id",
                [clinic.clinic_id]
              );

              const [result] = await pool.query(sql);

              return {
                clinic_id: clinic.clinic_id,
                clinic_name: clinic.clinic_name,
                specialties: [...result],
              };
            })
          );
        }

        let results = null;

        if (findAllClinic?.length) {
          results = await Promise.all(
            findAllSpecialty.map(async (item) => {
              const specialties = item.specialties;

              let calendar = [];

              if (specialties?.length) {
                calendar = await Promise.all(
                  specialties.map(async (specialty) => {
                    const calendar = SQLString.format(
                      "SELECT s.*, u.first_name, u.last_name, u.user_id, u.avatar FROM `schedules` s JOIN users u ON u.specialty_id = ? && s.doctor_id=u.user_id WHERE s.schedule_day IN (?) AND u.clinic_id=?",
                      [specialty.specialty_id, query, item.clinic_id]
                    );

                    // return { calendar, query };

                    const [result] = await pool.query(calendar);

                    return {
                      ...specialty,
                      calendar: result,
                    };
                  })
                );

                return {
                  clinic_id: item.clinic_id,
                  clinic_name: item.clinic_name,
                  specialties: calendar,
                };
              }

              return {
                clinic_id: item.clinic_id,
                clinic_name: item.clinic_name,
                calendar,
              };
            })
          );
        }

        return resolve(results);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  getById = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await DB.find({
          table: "schedules",
          conditions: { [this.primaryKey]: id },
        });

        if (!data) {
          return reject(
            new APIError(404, `Không tìm thấy trạng thái có id = ${id}`)
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
        let dataArrInsert = [];

        let checkDayExist = [];

        Object.keys(data.works).forEach((key) => {
          const schedule_day = new Date(key);
          let works = data.works[key]?.map((item) => ({
            ...item,
            available: false,
          }));

          works = JSON.stringify(works);

          checkDayExist = [
            ...checkDayExist,
            `${schedule_day.getFullYear()}-${
              schedule_day.getMonth() + 1
            }-${schedule_day.getDate()}`,
          ];

          dataArrInsert = [
            ...dataArrInsert,
            [schedule_day, works, data.doctorId],
          ];
        });

        // console.log(checkDayExist);

        const sql = SQLString.format(
          "SELECT * FROM ?? WHERE ??=? AND ?? IN (?)",
          [
            "schedules",
            "doctor_id",
            data.doctorId,
            "schedule_day",
            checkDayExist,
          ]
        );

        const [daysExist] = await pool.query(sql);

        // console.log(daysExist);

        if (daysExist?.length) {
          const dates = daysExist
            ?.map((data) => {
              const date = new Date(data.schedule_day);
              return `${date.getDate()}/${
                date.getMonth() + 1
              }/${date.getFullYear()}`;
            })
            .join(", ");

          return reject(
            new APIError(
              400,
              `Ngày ${dates} đã có lịch tồn tại. Vui lòng chọn cập nhật để hiệu chỉnh. Nếu muốn thêm lịch ngày khác vui lòng bỏ ngày này ra.`
            )
          );
        }

        await DB.createBulk({
          table: "schedules",
          data: dataArrInsert,
          fields: ["schedule_day", "works", "doctor_id"],
        });

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  update = (id, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await DB.update({
          table: this.table,
          data: data,
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
        const data = await DB.delete({
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

export default new ScheduleService();
