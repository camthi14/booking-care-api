import { APIError, responseAPI } from "../../../utils/index.js";
import historyService from "./history.service.js";

class HistoryController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await historyService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all history success!"));
    } catch (error) {
      return next(new APIError(error.statuCode || 500, error.message));
    }
  };

  create = async (req, res, next) => {
    const body = req.body;

    try {
      if (
        !body.history_desc ||
        !body.service_id ||
        !body.doctor_id ||
        !body.work_id
      ) {
        return next(
          new APIError(
            404,
            "Missing history_desc service_id doctor_id work_id "
          )
        );
      }

      const response = await historyService.create({ ...body });

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      return next(new APIError(error.statuCode || 500, error.message));
    }
  };

  deleteById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await historyService.deleteById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Delete by ${id} history success!`));
    } catch (error) {
      return next(new APIError(error.statuCode || 500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await historyService.delete();

      return res
        .status(200)
        .json(responseAPI(response, "Delete history success!"));
    } catch (error) {
      return next(new APIError(error.statuCode || 500, error.message));
    }
  };
}

export default new HistoryController();
