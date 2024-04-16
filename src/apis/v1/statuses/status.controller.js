import { APIError, responseAPI } from "../../../utils/index.js";
import statusService from "./status.service.js";

class StatusController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await statusService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all status success!"));
    } catch (error) {
      return next(new APIError(500, error.message));
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await statusService.getById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Get by ${id} status success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  create = async (req, res, next) => {
    try {
      const body = req.body;

      if (!body.type || !body.desc || !body.key || !body.value) {
        return next(new APIError(404, "Missing exits type desc key value"));
      }

      const response = await statusService.create({ ...body });

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      return next(new APIError(500, error.message));
    }
  };

  update = async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;

      const response = await statusService.update(id, data);

      return res.status(200).json(responseAPI(response, "Update success!"));
    } catch (error) {
      return next(new APIError(500, error.message));
    }
  };

  deleteById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await statusService.deleteById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Delete by ${id} status success!`));
    } catch (error) {
      return next(new APIError(500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await statusService.delete();

      return res
        .status(200)
        .json(responseAPI(response, "Delete status success!"));
    } catch (error) {
      return next(new APIError(500, error.message));
    }
  };
}

export default new StatusController();
