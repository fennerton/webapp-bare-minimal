import { Staff } from "../db-models/staff.model";
import { ApplicationRight } from "../db-models/application-right.model";
import { Authentication } from "../../interfaces/authentication";
import { VerifyFunction } from "passport-local";

const WRONG_USERNAME_PASSWORD = {
  status: 401,
  message: "Invalid staff ID / email / password",
};

const INIT_NOT_DONE = {
  status: 402,
  message: "Please reset your password for the first time login",
};

export const loginVerify: VerifyFunction = async (login, password, done) => {
  try {
    const user = await Staff.findOne({
      $or: [{ staffId: login }, { email: login }],
    }).populate("roleDetail");

    if (!user) {
      return done(null, false, WRONG_USERNAME_PASSWORD);
    }
    if (!user.isValidPassword(password)) {
      return done(null, false, WRONG_USERNAME_PASSWORD);
    }
    if (!user.initializationDone) {
      return done(null, false, INIT_NOT_DONE);
    }

    const userRoleDetail = user.roleDetail;

    let userRights = userRoleDetail.associatedRights;

    if (userRoleDetail.devOnly) {
      const allRights = await ApplicationRight.find(
        {},
        {},
        { lean: true },
      ).lean();
      userRights = allRights.map((r) => r.name);
    }

    delete userRoleDetail.associatedRights;
    delete userRoleDetail.devOnly;

    const userObj: Authentication = {
      staffId: user.staffId,
      name: user.firstName + " " + user.lastName,
      email: user.email,
      avatar: user.avatar,
      role: { ...userRoleDetail, rights: userRights },
    };

    return done(null, userObj);
  } catch (err) {
    return done(err);
  }
};
