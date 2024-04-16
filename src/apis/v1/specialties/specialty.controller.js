import { APIError, cloudinary, responseAPI } from "../../../utils/index.js";
import specialtyService from "./specialty.service.js";
import _ from "lodash";

class SpecialtyController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await specialtyService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all specialty success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await specialtyService.getById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Get by ${id} specialty success!`));
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
    const specialty_img = req.file;

    try {
      if (
        !body.specialty_name ||
        _.isEmpty(specialty_img) ||
        !body.specialty_desc ||
        !body.slug
      ) {
        !_.isEmpty(specialty_img) &&
          (await cloudinary.uploader.destroy(specialty_img.filename));
        return next(
          new APIError(
            404,
            "Missing specialty_name specialty_img specialty_desc slug"
          )
        );
      }

      const response = await specialtyService.create({
        ...body,
        specialty_img: specialty_img.path,
        specialty_img_name: specialty_img.filename,
      });

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      !_.isEmpty(specialty_img) &&
        (await cloudinary.uploader.destroy(specialty_img.filename));

      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  update = async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    const file = req.file;

    try {
      const response = await specialtyService.update(id, {
        ...data,
        specialty_img: _.isEmpty(file) ? null : file,
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

      const response = await specialtyService.deleteById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Delete by ${id} specialty success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await specialtyService.delete();

      return res
        .status(200)
        .json(responseAPI(response, "Delete specialty success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new SpecialtyController();
