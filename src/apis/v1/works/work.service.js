import { DB } from "../../../database/index.js";

class WorkService {
  table = "works";

  getAll = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await DB.findAll({
          table: this.table,
          filters: { limit: 50, offset: 0 },
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  create = (data = []) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await DB.createBulk({
          data: data,
          fields: ["key", "value", "desc"],
          table: this.table,
        });

        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  };
}

export default new WorkService();
