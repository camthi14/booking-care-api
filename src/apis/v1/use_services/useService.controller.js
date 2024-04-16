import _ from "lodash";
import { APIError, cloudinary, responseAPI } from "../../../utils/index.js";
import useServiceService from "./useService.service.js";

class UseServiceController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await useServiceService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all service success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await useServiceService.getById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Get by ${id} service success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   * @returns
   */
  create = async (req, res, next) => {
    const body = req.body;
    const service_img = req.file;

    try {
      if (
        !body.service_name ||
        _.isEmpty(service_img) ||
        !body.service_desc ||
        !body.service_price
      ) {
        !_.isEmpty(service_img) &&
          (await cloudinary.uploader.destroy(service_img.filename));
        return next(
          new APIError(
            404,
            "Missing service_name service_img  service_desc service_price"
          )
        );
      }

      const response = await useServiceService.create({
        ...body,
        service_img: service_img.path,
        service_img_name: service_img.filename,
      });

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      !_.isEmpty(service_img) &&
        (await cloudinary.uploader.destroy(service_img.filename));

      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  update = async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    const file = req.file;

    try {
      const response = await useServiceService.update(id, {
        ...data,
        service_img: _.isEmpty(file) ? null : file,
      });

      return res.status(200).json(responseAPI(response, "Update success!"));
    } catch (error) {
      !_.isEmpty(file) && (await cloudinary.uploader.destroy(file.filename));
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  deleteById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await useServiceService.deleteById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Delete by ${id} service success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await useServiceService.delete();

      return res
        .status(200)
        .json(responseAPI(response, "Delete service success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getFilter = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await useServiceService.getFilter({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get filter service success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getServiceCount = async (req, res, next) => {
    try {
      const response = await useServiceService.getServiceCount();

      return res
        .status(200)
        .json(responseAPI(response, "Get count service success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new UseServiceController();
