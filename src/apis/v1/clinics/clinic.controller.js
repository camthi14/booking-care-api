import _ from "lodash";
import { APIError, cloudinary, responseAPI } from "../../../utils/index.js";
import clinicService from "./clinic.service.js";

class ClinicController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await clinicService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all clinic success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await clinicService.getById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Get by ${id} clinic success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getAllSpecialtyClinic = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await clinicService.getAllSpecialtyClinic(id);

      return res
        .status(200)
        .json(responseAPI(response, `Get by ${id} clinic success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  create = async (req, res, next) => {
    const body = req.body;
    const clinic_img = req.file;

    try {
      if (
        !body.clinic_name ||
        !body.type ||
        _.isEmpty(clinic_img) ||
        !body.clinic_desc ||
        !body.clinic_address ||
        !body.slug
      ) {
        !_.isEmpty(clinic_img) &&
          (await cloudinary.uploader.destroy(clinic_img.filename));
        return next(
          new APIError(
            404,
            "Missing clinic_name type clinic_img clinic_desc clinic_address slug"
          )
        );
      }

      const response = await clinicService.create({
        ...body,
        clinic_img: clinic_img.path,
        clinic_img_name: clinic_img.filename,
      });

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      !_.isEmpty(clinic_img) &&
        (await cloudinary.uploader.destroy(clinic_img.filename));
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  update = async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    const file = req.file;

    try {
      const response = await clinicService.update(id, {
        ...data,
        clinic_img: _.isEmpty(file) ? null : file,
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

      const response = await clinicService.deleteById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Delete by ${id} clinic success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await clinicService.delete();

      return res
        .status(200)
        .json(responseAPI(response, "Delete clinic success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getClinicCount = async (req, res, next) => {
    try {
      const response = await clinicService.getClinicCount();

      return res
        .status(200)
        .json(responseAPI(response, "Get count clinic success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new ClinicController();
