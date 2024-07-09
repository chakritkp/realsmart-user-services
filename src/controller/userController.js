import {
  getUsers,
  getUser,
  gerRoles,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
  deleteUser,
} from "../services/userServices.js";

export const getUsersController = async (req, res) => {
  try {
    const { data, count } = await getUsers(req, res);
    res.status(200).json({
      data: data,
      meta: {
        count: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const gerRolesController = async (req, res) => {
  try {
    const { data, count } = await gerRoles(req, res);
    res.status(200).json({
      data,
      meta: {
        count: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const getUserController = async (req, res) => {
  try {
    await getUser(req, res);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const registerUserController = async (req, res) => {
  try {
    await registerUser(req, res);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const updateUserController = async (req, res) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    await deleteUser(req, res);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const loginUserController = async (req, res) => {
  try {
    await loginUser(req, res);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    await logoutUser(req, res);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};
