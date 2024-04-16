import pool from "./init.mysql.js";
import SQLString from "sqlstring";
import _ from "lodash";

class DB {
  static findAll = async ({ table = "", filters = {} }) => {
    let sql = this._sqlLimit({
      table,
      limit: filters.limit,
      offset: filters.offset,
    });

    if (!filters.search && filters.order) {
      sql = this._sqlOrder({
        table,
        order: filters.order,
        limit: filters.limit,
        offset: filters.offset,
      });
    } else if (filters.search && filters.field && !filters.order) {
      sql = this._sqlSearch({
        table,
        search: filters.search,
        limit: filters.limit,
        offset: filters.offset,
        field: filters.field,
      });
    } else if (filters.search && filters.field && filters.order) {
      sql = this._sqlOrderAndSearch({
        table,
        order: filters.order,
        search: filters.search,
        limit: filters.limit,
        offset: filters.offset,
        field: filters.field,
      });
    } else if (filters.whereBy) {
      sql = this._whereBy({
        table,
        whereBy: filters.whereBy,
        limit: filters.limit,
        offset: filters.offset,
      });
    }

    try {
      const [result] = await pool.query(sql);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  static _sqlLimit = ({ table = "", limit = "", offset = "" }) => {
    return SQLString.format("SELECT * FROM ?? LIMIT ? OFFSET ?", [
      table,
      limit,
      offset,
    ]);
  };

  static _sqlOrder = ({ table = "", order = "", limit = "", offset = "" }) => {
    const orderBy = order.split(",").join(" ");
    return SQLString.format(
      "SELECT * FROM ?? ORDER BY " + orderBy + " LIMIT ? OFFSET ?",
      [table, limit, offset]
    );
  };

  static _whereBy = ({
    table = "",
    whereBy = { key: "", value: "" },
    limit = "",
    offset = "",
  }) => {
    return SQLString.format("SELECT * FROM ?? WHERE ??=? LIMIT ? OFFSET ?", [
      table,
      whereBy.key,
      whereBy.value,
      limit,
      offset,
    ]);
  };

  static _sqlSearch = ({
    table = "",
    search = "",
    limit = "",
    offset = "",
    field = "",
  }) => {
    return SQLString.format(
      "SELECT * FROM ?? WHERE ?? LIKE ? LIMIT ? OFFSET ?",
      [table, field, `%${search}%`, limit, offset]
    );
  };

  static _sqlOrderAndSearch = ({
    table = "",
    search = "",
    order = "",
    limit = "",
    offset = "",
    field = "",
  }) => {
    const orderBy = order.split(",").join(" ");

    return (sql = SQLString.format(
      "SELECT * FROM ?? WHERE ?? LIKE ? ORDER BY " +
        orderBy +
        " LIMIT ? OFFSET ?",
      [table, field, `%${search}%`, limit, offset]
    ));
  };

  static find = async ({ table = "", conditions = {} }) => {
    let condition = "";
    let values = [];

    /**
     * Duyệt qua key của 1 object lấy key
     * VD1: obj = {test: "test 1"}
     * sau khi duyệt => key = test
     * * => response condition = "`test` = ?";
     *
     * VD2: obj = {test: "test 1", age: 50}
     * * => response condition = "`test` = ? AND `age` = ?";
     */
    Object.keys(conditions).forEach((key, index) => {
      if (index > 0) {
        condition += " AND ";
      }

      condition += `\`${key}\` = ?`;
      /**
       * values = []
       * sử dụng ...values => []
       * ,condition[key] => value.
       */
      values = [...values, conditions[key]];
    });

    const sql = SQLString.format(`SELECT * FROM  ?? WHERE ${condition}`, [
      table,
      ...values,
    ]);

    try {
      const [result] = await pool.query(sql);
      return !_.isEmpty(result[0]) ? result[0] : null;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  static create = async ({ table = "", data = {} }) => {
    const sql = SQLString.format("INSERT INTO ?? SET ?", [table, data]);

    try {
      const [result] = await pool.query(sql);
      return result.insertId;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  static update = async ({ table = "", data = {}, field = "", id = 0 }) => {
    const sql = SQLString.format("UPDATE ?? SET ? WHERE ??=?", [
      table,
      data,
      field,
      id,
    ]);

    try {
      const [result] = await pool.query(sql);
      return result.affectedRows === 1 ? true : false;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  static delete = async ({ table = "", field = "", id = 0 }) => {
    if (id === 0) {
      const sql = SQLString.format("DELETE FROM ??", [table]);

      try {
        const [result] = await pool.query(sql);
        return result;
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const sql = SQLString.format("DELETE FROM ?? WHERE ??=?", [
      table,
      field,
      id,
    ]);

    try {
      const [result] = await pool.query(sql);
      return result.affectedRows === 0 ? false : true;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  static count = async ({
    table = "",
    whereBy = {},
    condition = "",
    values = [],
  }) => {
    let sql = SQLString.format("SELECT count(*) as totalRow FROM ??", [table]);

    if (!_.isEmpty(whereBy)) {
      sql = SQLString.format("SELECT count(*) as totalRow FROM ?? WHERE ??=?", [
        table,
        whereBy.key,
        whereBy.value,
      ]);
    }

    if (condition && values.length) {
      sql = SQLString.format(
        `SELECT count(*) as totalRow FROM ?? b WHERE ${condition}`,
        [table, ...values]
      );
    }

    try {
      const [result] = await pool.query(sql);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  static createBulk = async ({ data = [], fields = [], table = "" }) => {
    try {
      const newFields = fields.map((i) => `\`${i}\``).join(",");
      const sql = "INSERT INTO `" + table + `\` (${newFields}) VALUES ?`;

      const [result] = await pool.query(sql, [data]);

      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  static handleChangeConditions = (conditions = {}) => {
    let condition = "";
    let values = [];

    Object.keys(conditions).forEach((key, index) => {
      if (index > 0) {
        condition += " AND ";
      }

      const cutKey = key.split(".");

      if (cutKey.length > 1) {
        condition += `${cutKey[0]}.${cutKey[1]} = ?`;
      } else {
        condition += `\`${cutKey[0]}\` = ?`;
      }

      values = [...values, conditions[key]];
    });

    return { condition, values };
  };

  static getAll = async ({ table = "", conditions = {} }) => {
    let condition = "";
    let values = [];

    Object.keys(conditions).forEach((key, index) => {
      if (index > 0) {
        condition += " AND ";
      }

      condition += `\`${key}\` = ?`;

      values = [...values, conditions[key]];
    });

    const prepare = _.isEmpty(conditions)
      ? "SELECT * FROM ??"
      : `SELECT * FROM  ?? WHERE ${condition}`;

    const dependency = _.isEmpty(conditions) ? [table] : [table, values];

    const sql = SQLString.format(prepare, dependency);

    try {
      const [result] = await pool.query(sql);
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  };
}

export default DB;
