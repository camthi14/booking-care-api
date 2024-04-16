import SQLString from "sqlstring";
import { DB, pool } from "../../../database/index.js";
import { APIError, formatDateUnder } from "../../../utils/index.js";
import emailService from "../emails/email.service.js";
import { bookingTemplate, formatDate } from "../emails/email.template.js";

const statuses = {
  unpaid: "unpaid",
  paid: "paid",
  succeeded: "succeeded",
  complete: "complete",
  cancel: "cancel",
  waiting: "waiting",
};

const transferStatuses = {
  unpaid: statuses.succeeded,
  paid: statuses.succeeded,
  succeeded: statuses.complete,
  cancel: statuses.cancel,
};

class BookingService {
  table = "bookings";
  primaryKey = "booking_id";

  getAll = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const page = +filters?.page || 1;
        const limit = +filters?.limit || 4;
        const offset = limit * (page - 1);
        const search = filters?.search;
        const field = filters?.field;
        const order = filters?.order;

        // * where=user_id,13;date,13-04-05
        const where = filters?.where;
        let responseCondition = {
          condition: "",
          values: [],
        };

        if (where) {
          let cutWhere = where.split(";");

          const whereBy = cutWhere.reduce((obj, where) => {
            const cut = where.split(",");
            return { ...obj, [cut[0]]: cut[1] };
          }, {});

          responseCondition = {
            ...responseCondition,
            ...DB.handleChangeConditions(whereBy),
          };
        }

        let sql = SQLString.format(
          "SELECT b.*, u.user_id, u.first_name, u.last_name FROM `bookings` b JOIN users u ON b.doctor_id=u.user_id ORDER BY b.booking_id DESC LIMIT ? OFFSET ?",
          [limit, offset]
        );

        if (!search && order) {
          const orderBy = order.split(",").join(" ");
          sql = SQLString.format(
            "SELECT b.*, u.user_id, u.first_name, u.last_name FROM `bookings` b JOIN users u ON b.doctor_id=u.user_id ORDER BY " +
              orderBy +
              " LIMIT ? OFFSET ? ",
            [limit, offset]
          );
        } else if (search && field && !order) {
          sql = SQLString.format(
            "SELECT b.*, u.user_id, u.first_name, u.last_name FROM `bookings` b JOIN users u ON b.doctor_id=u.user_id WHERE ?? LIKE ? ORDER BY b.booking_id DESC LIMIT ? OFFSET ? ",
            [field, `%${search}%`, limit, offset]
          );
        } else if (search && field && order) {
          const orderBy = order.split(",").join(" ");
          sql = SQLString.format(
            "SELECT b.*, u.user_id, u.first_name, u.last_name FROM `bookings` b JOIN users u ON b.doctor_id=u.user_id WHERE ?? LIKE ? ORDER BY " +
              orderBy +
              " LIMIT ? OFFSET ? ",
            [field, `%${search}%`, limit, offset]
          );
        } else if (responseCondition.condition) {
          sql = SQLString.format(
            `SELECT b.*, u.user_id, u.first_name, u.last_name FROM \`bookings\` b JOIN users u ON b.doctor_id=u.user_id WHERE ${responseCondition.condition} ORDER BY b.booking_id DESC LIMIT ? OFFSET ?`,
            [...responseCondition.values, limit, offset]
          );
        }

        const totalRow = await DB.count({
          table: this.table,
          condition: responseCondition.condition,
          values: responseCondition.values,
        });

        const [result] = await pool.query(sql);

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
          return reject(new APIError(404, `Không tim thấy trạng thái có id = ${id}`));
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  };

  create = (data = {}) => {
    return new Promise(async (resolve, reject) => {
      let id = -1;
      try {
        const work = await DB.find({
          table: "works",
          conditions: {
            work_id: data.work_id,
          },
        });

        // console.log(formatDateUnder(data.booking_date));

        let sql = SQLString.format(
          "SELECT * FROM `bookings` WHERE `user_id`=? && `work_id`=? && `status` IN ('unpaid', 'paid', 'successed', 'waitting') AND `booking_date` = ?;",
          [data.user_id, data.work_id, formatDateUnder(data.booking_date)]
        );

        const [billExist] = await pool.query(sql);

        if (billExist?.length) {
          throw new APIError(
            409,
            `${formatDate(data.booking_date)} Thời gian ${work.value} của bạn đã được đặt trước đó!`
          );
        }

        // * Kiểm tra email.
        // await emailService.validationEmail(data.email, `E-mail ${data.email} Không hợp lệ!`);

        sql = SQLString.format(
          "SELECT CONCAT(u.first_name, ' ', u.last_name) AS doctor_name, c.clinic_name, s.specialty_name FROM `users` u JOIN clinics c ON u.user_id = ? AND u.clinic_id=c.clinic_id JOIN specialties s ON u.specialty_id=s.specialty_id;",
          [data.doctor_id]
        );

        const [result] = await pool.query(sql);

        if (!result) {
          throw new APIError(404, "Doctor not found");
        }

        id = await DB.create({
          table: this.table,
          data: {
            ...data,
            booking_date: formatDateUnder(data.booking_date),
            status: data.payments === "offline" ? statuses.unpaid : statuses.waiting,
          },
        });

        const schedule = await DB.find({
          table: "schedules",
          conditions: {
            doctor_id: data.doctor_id,
            schedule_day: formatDateUnder(data.booking_date),
          },
        });

        if (schedule) {
          let works = JSON.parse(schedule.works);

          if (works?.length) {
            works = works.map((work) => {
              if (+work.work_id === +data.work_id) {
                return { ...work, available: true };
              }

              return { ...work };
            });

            await DB.update({
              table: "schedules",
              data: {
                works: JSON.stringify(works),
              },
              id: schedule.schedule_id,
              field: "schedule_id",
            });
          }
        }

        if (data.payments === "offline") {
          await this.sendEmailBookingSuccess({
            id: id,
            data: data,
            userInfo: result[0],
            workInfo: work,
          });
        }

        resolve(id);
      } catch (error) {
        console.log("error:::", error);
        if (id != -1) {
          await DB.delete({
            table: "bookings",
            field: "booking_id",
            id: id,
          });
        }
        reject(error);
      }
    });
  };

  sendEmailBookingSuccess = async ({ id, data, userInfo, workInfo }) => {
    try {
      await emailService.sendEmail({
        email: data.email,
        html: bookingTemplate({
          email: data.email,
          date: data.booking_date,
          bookingId: id,
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
          gender: data.gender,
          payments: data.payments,
          ...userInfo,
          reason_exam: data.reason_exam,
          price: data.price,
          work: `${workInfo.desc}, ${workInfo.value}`,
        }),
        subject: "[THÔNG TIN ĐẶT LỊCH KHÁM BỆNH]",
      });
    } catch (error) {
      throw new APIError(500, error.message);
    }
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

  transferStatus = async (bookingId, status) => {
    try {
      const response = await DB.update({
        table: "bookings",
        data: {
          status: transferStatuses[status],
        },
        field: "booking_id",
        id: bookingId,
      });

      if (!response) {
        throw new APIError(404, "Hoá đơn không tồn tại với id = " + bookingId);
      }

      // if cancel then resolve schedule
      if (status === statuses.cancel) {
        // return schedule for patients
        const booking = await DB.find({ table: "bookings", conditions: { booking_id: bookingId } });

        if (booking) {
          const { booking_date, work_id, doctor_id } = booking;

          const foundSchedule = await DB.find({
            table: "schedules",
            conditions: { doctor_id, schedule_day: new Date(booking_date) },
          });

          if (foundSchedule) {
            const { works, schedule_id } = foundSchedule;
            const convertWorks = JSON.parse(works);

            if (convertWorks?.length) {
              // console.log(`convertWorks:::`, convertWorks);
              // console.log(`schedule_id:::`, schedule_id);

              const updatedWorks = convertWorks.map((work) => {
                if (work?.work_id === work_id) {
                  return { ...work, available: false };
                }

                return work;
              });

              await DB.update({
                data: { works: JSON.stringify(updatedWorks) },
                field: "schedule_id",
                id: schedule_id,
                table: "schedules",
              });
            }
          }
        }
      }

      return true;
    } catch (error) {
      throw new APIError(error.statusCode || 500, error.message);
    }
  };

  getBookingCount = async (status = "") => {
    try {
      let payload = { table: "bookings" };

      if (status) {
        payload = {
          ...payload,
          whereBy: {
            key: "status",
            value: status,
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

export default new BookingService();
