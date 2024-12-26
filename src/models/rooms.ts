import { DataTypes } from "sequelize";
import { roomsShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";

const RoomsSchema = DBconnect.define(
  "tblRooms",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "tblRooms",
    timestamps: true,
    freezeTableName: true,
  },
);

//RoomsSchema.sync({ alter: true });

export const RoomsModel = RoomsSchema;

// Create a new Rooms entry
export const saveRooms = async (data: Record<string, unknown>) => {
  try {
    const newRooms = await RoomsModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Rooms created successfully",
      payload: newRooms,
    };
  } catch (err) {
    console.error("Error creating Rooms:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating Rooms",
      payload: null,
    };
  }
};

// Find a Rooms by any filter
export const findRooms = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const Rooms = await RoomsModel.findOne(filter);
    if (!Rooms) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Rooms not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Rooms found",
      payload: Rooms,
    };
  } catch (err) {
    console.error("Error finding Rooms:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Rooms",
      payload: null,
    };
  }
};

// Find all Roomss
export const findAll = async (filter: any) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      RoomsModel.findAll(filter),
      RoomsModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Rooms not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Roomss retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    console.error("Error retrieving Roomss:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving Roomss",
      error: (err as Error).message || "Error retrieving Roomss",
    };
  }
};

// Find a Rooms by ID
export const findRoomsById = async (id: string) => {
  try {
    const Rooms = await RoomsModel.findByPk(id);
    if (!Rooms) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Rooms not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Rooms found",
      payload: Rooms,
    };
  } catch (err) {
    console.error("Error finding Rooms by ID:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Rooms",
      payload: null,
    };
  }
};

// Update a Rooms by ID
export const updateRoomsById = async (
  id: string | undefined,
  updateData: Partial<roomsShemType>,
) => {
  try {
    const [rowsUpdated, [updatedRooms]] = await RoomsModel.update(updateData, {
      where: { id },
      returning: true, // To return the updated record
    });
    if (rowsUpdated === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No Rooms records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Rooms updated successfully",
      payload: updatedRooms,
    };
  } catch (err) {
    console.error("Error updating Rooms:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating Rooms",
      payload: null,
    };
  }
};

// Delete a Rooms by ID
export const deleteRoomsById = async (id: string) => {
  try {
    const deletedRooms = await RoomsModel.destroy({ where: { id } });
    if (!deletedRooms) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Rooms not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Rooms deleted successfully",
      payload: null,
    };
  } catch (err) {
    console.error("Error deleting Rooms:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting Rooms",
      payload: null,
    };
  }
};
