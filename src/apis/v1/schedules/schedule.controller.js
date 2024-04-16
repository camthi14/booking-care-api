import { APIError, responseAPI } from "../../../utils/index.js";
import scheduleService from "./schedule.service.js";

class ScheduleController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;

      const response = await scheduleService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all schedule success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await scheduleService.getById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Get by ${id} schedule success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  create = async (req, res, next) => {
    try {
      const body = req.body;

      if (!body.doctorId) {
        return next(new APIError(404, "Missing doctor_id"));
      }

      const response = await scheduleService.create({ ...body });

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;

      const response = await scheduleService.update(id, data);

      return res.status(200).json(responseAPI(response, "Update success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  deleteById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await scheduleService.deleteById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Delete by ${id} schedule success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await scheduleService.delete();

      return res
        .status(200)
        .json(responseAPI(response, "Delete schedule success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new ScheduleController();
