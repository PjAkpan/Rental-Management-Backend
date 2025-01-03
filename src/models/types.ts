import { Helpers } from "../types";
import { Model } from "sequelize";

export type ActiveSession = {
  deviceId: string;
  token: string;
  loginTime: Date;
};

export type usersShemType = {
  ProfileCompleted: string;
  _id: string;
  username: string;
  id?: string; // Use lowercase 'id' to match the Sequelize field
  fullName: string;
  phoneNumber?: string; // Optional, based on validation
  deviceId: string;
  roomNumber: string;
  role?: string;
  profileImage?: string; // Optional, based on validation
  homeAddress?: string;
  occupation?: string;
  pin?: string;
  email: string; // Should be unique
  password: string; // Should not be stored as plain text
  ipAddress?: string[]; // Array of strings for multiple IP addresses
  status: string;
  activeSession?: ActiveSession[];
  isActive: boolean;
  isVerified?: boolean;
  referenceId?: string;
} & Model &
  Helpers.Timestamps;

export type FindInfoParams = {
  orderBy?: string;
  sort?: "ASC" | "DESC";
  size?: number;
  page?: number;
  gSearch?: string;
  filter?: Record<string, unknown>;
  status?: string;
  option?: string;
  startDate?: string;
  endDate?: string;
};

export type pinShemType = {
  id: string;
  deviceId: string;
  fcmToken?: string;
  userId: string;
  pin: string;
} & Model &
  Helpers.Timestamps;

export type otpShemType = {
  id: string;
  initiatorId: string;
  otpNumber: string | number;
  referenceId: string;
  status: string;
  isActive: boolean;
  otpTime: Date;
} & Model &
  Helpers.Timestamps;

export type maintenanceShemType = {
  Id?: string;
  id?: string;
  subject: string;
  userId: string;
  description: string;
  pictureProof: string;
  videoProof: string;
  referenceId: string;
  status: string;
  isActive: boolean;
} & Model &
  Helpers.Timestamps;

export type RentPaymentShemType = {
  id: string;
  roomNumber: string;
  paymentAmount: string;
  userId: string;
  pictureProof: string;
  paymentDate: string;
  nextRentDueDate?: string;
  isActive?: boolean;
  tenantName?: string;
} & Model &
  Helpers.Timestamps;

export type accountDetailsShemType = {
  Id?: string;
  name: "ordinaryuser" | "backend" | "superadmin";
  status: string;
  isActive: boolean;
} & Model &
  Helpers.Timestamps;

export type roomsShemType = {
  id?: string;
  roomStatus: "available" | "occupied" | "taken" | "empty";
  roomNumber: string;
  isActive: boolean;
} & Model &
  Helpers.Timestamps;

export type notificationShemType = {
  Id?: string;
  name: "ordinaryuser" | "backend" | "superadmin";
  status: string;
  isActive: boolean;
} & Model &
  Helpers.Timestamps;
