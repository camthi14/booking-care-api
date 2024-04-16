import { APIError, responseAPI } from "../../../utils/index.js";
import works from "./create-work.js";
import workService from "./work.service.js";

class WorkController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await workService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all work success!"));
    } catch (error) {
      console.log(error);
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  create = async (req, res, next) => {
    try {
      // const body = req.body;

      // if (!body.desc || !body.key || !body.value) {
      //   return next(new APIError(404, "Missing desc key value"));
      // }

      const response = await workService.create(works);

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new WorkController();
