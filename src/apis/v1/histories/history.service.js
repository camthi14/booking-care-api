import { DB } from "../../../database/index.js";
import { APIError } from "../../../utils/index.js";

class HistoryService {
  table = "histories";

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
        const id = await DB.create({ table: this.table, data: data });

        resolve(await this.getById(id));
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

export default new HistoryService();
