import _ from "lodash";
import { APIError, cloudinary, responseAPI } from "../../../utils/index.js";
import userService from "./user.service.js";

class UserController {
  getAll = async (req, res, next) => {
    try {
      const filters = req.query;
      const response = await userService.getAll({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "Get all user success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await userService.getById(id);
      const { password, ...others } = response;

      return res
        .status(200)
        .json(responseAPI(others, `Get by ${id} user success!`));
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
    const avatar = req.file;

    try {
      if (
        !body.first_name ||
        !body.last_name ||
        !body.email ||
        !body.password ||
        !body.phone ||
        !body.address ||
        !body.gender ||
        !body.role ||
        _.isEmpty(avatar)
      ) {
        !_.isEmpty(avatar) &&
          (await cloudinary.uploader.destroy(avatar.filename));

        return next(
          new APIError(
            404,
            "Missing first_name last_name email password phone address gender doctor_position role avatar"
          )
        );
      }

      const response = await userService.create({
        ...body,
        avatar: avatar.path,
        file_name_avatar: avatar.filename,
      });

      return res.status(201).json(responseAPI(response, "Create success!"));
    } catch (error) {
      !_.isEmpty(avatar) &&
        (await cloudinary.uploader.destroy(avatar.filename));

      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  update = async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    const file = req.file;

    try {
      const response = await userService.update(id, {
        ...data,
        avatar: _.isEmpty(file) ? null : file,
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

      const response = await userService.deleteById(id);

      return res
        .status(200)
        .json(responseAPI(response, `Delete by ${id} user success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  delete = async (req, res, next) => {
    try {
      const response = await userService.delete();

      return res
        .status(200)
        .json(responseAPI(response, "Delete user success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getDoctor = async (req, res, next) => {
    try {
      const filters = req.query;

      const response = await userService.getDoctor({ ...filters });

      return res
        .status(200)
        .json(responseAPI(response, "getDoctor user success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getDoctorById = async (req, res, next) => {
    try {
      const id = req.params.id;

      const response = await userService.getDoctorById(id);
      const { password, ...others } = response;

      return res
        .status(200)
        .json(responseAPI(others, `Get by ${id} user success!`));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };

  getUserCount = async (req, res, next) => {
    try {
      const response = await userService.getUserCount(req.query.role);

      return res
        .status(200)
        .json(responseAPI(response, "Get count role user success!"));
    } catch (error) {
      return next(new APIError(error.statusCode || 500, error.message));
    }
  };
}

export default new UserController();
