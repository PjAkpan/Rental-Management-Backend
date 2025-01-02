import { DataTypes } from "sequelize";
import { notificationShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";

const NotificationSchema = DBconnect.define(
  "tblNotification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    socketInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      get: function () {
        try {
          return JSON.parse(this.getDataValue("socketInfo"));
        } catch (err) {
          return this.getDataValue("socketInfo");
        }
      },
      set: function (value) {
        this.setDataValue("socketInfo", JSON.stringify(value));
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    // isDeleted: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: true,
    //   defaultValue: false,
    // },
  },
  {
    tableName: "tblNotification",
    timestamps: true,
    freezeTableName: true,
  },
);

//NotificationSchema.sync({ alter: true });

export const NotificationModel = NotificationSchema;

// Create a new Notification entry
export const saveNotification = async (data: Record<string, unknown>) => {
  try {
    const newNotification = await NotificationModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Notification created successfully",
      payload: newNotification,
    };
  } catch (err) {
    console.error("Error creating Notification:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating Notification",
      payload: null,
    };
  }
};

// Find a Notification by any filter
export const findNotification = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const Notification = await NotificationModel.findOne(filter);
    if (!Notification) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Notification not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Notification found",
      payload: Notification,
    };
  } catch (err) {
    console.error("Error finding Notification:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Notification",
      payload: null,
    };
  }
};

// Find all Notifications
export const findAll = async (filter: any) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      NotificationModel.findAll(filter),
      NotificationModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Notification not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Notifications retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    console.error("Error retrieving Notifications:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving Notifications",
      error: (err as Error).message || "Error retrieving Notifications",
    };
  }
};

// Find a Notification by ID
export const findNotificationById = async (id: string) => {
  try {
    const Notification = await NotificationModel.findByPk(id);
    if (!Notification) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Notification not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Notification found",
      payload: Notification,
    };
  } catch (err) {
    console.error("Error finding Notification by ID:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Notification",
      payload: null,
    };
  }
};

// Update a Notification by ID
export const updateNotificationById = async (
  id: string | undefined,
  updateData: Partial<notificationShemType>,
) => {
  try {
    const [rowsUpdated, [updatedNotification]] = await NotificationModel.update(
      updateData,
      {
        where: { id },
        returning: true, // To return the updated record
      },
    );
    if (rowsUpdated === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No Notification records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Notification updated successfully",
      payload: updatedNotification,
    };
  } catch (err) {
    console.error("Error updating Notification:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating Notification",
      payload: null,
    };
  }
};

// Delete a Notification by ID
export const deleteNotificationById = async (id: string) => {
  try {
    const deletedNotification = await NotificationModel.destroy({
      where: { id },
    });
    if (!deletedNotification) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Notification not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Notification deleted successfully",
      payload: null,
    };
  } catch (err) {
    console.error("Error deleting Notification:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting Notification",
      payload: null,
    };
  }
};
