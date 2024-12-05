/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataTypes } from "sequelize";
import { usersShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";
import { logger } from "netwrap";

const UserProfileSchema = DBconnect.define(
  "tblUserProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    profileId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    profileImage: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Assuming emails should be unique
    },

    homeAddress: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional
    },
    occupation: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional
    },

    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: "tblUserProfile",
    timestamps: true,
    freezeTableName: true,
  },
);

//UserProfileSchema.sync({ force: true });

export const UserProfileModel = UserProfileSchema;

export const saveUsersProfile = async (data: Record<string, unknown>) => {
  try {
    const newUsers = (await UserProfileModel.create(data)) as usersShemType;
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Users profile created successfully",
      payload: newUsers,
    };
  } catch (err) {
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating Users profile",
      payload: null,
    };
  }
};

export const findUsers = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const Users = await UserProfileModel.findOne(filter);
    if (!Users) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Users not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "User already exist",
      payload: Users as usersShemType,
    };
  } catch (err) {
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Users",
      payload: null,
    };
  }
};
