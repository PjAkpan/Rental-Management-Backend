import { routeCreator } from "../utils";

export const urls = {
  health: {
    check: () => routeCreator("check"),
  },
  users: {
    check: () => routeCreator("check"),
    createUsers: () => routeCreator("add", "post"),
    logoutAllDevices: () => routeCreator("logout", "post"),
    loginUsers: () => routeCreator("login", "post"),
    mobileUsersLogin: () => routeCreator("device/login", "post"),
    deleteUsers: () => routeCreator("delete/:id", "delete"),
    modifyUsers: () => routeCreator("update", "put"),
    viewSingleUsers: () => routeCreator("view/:id"),
    viewAllUsers: () => routeCreator("fetch/all"),
    viewAUsersProfile: () => routeCreator("profile/:id"),
  },
  resources: {
    check: () => routeCreator("check"),
    verifyBankAccount: () => routeCreator("check/account", "post"),
    viewBanks: () => routeCreator("view/banks"),
  },
  otp: {
    check: () => routeCreator("check"),
    createOtp: () => routeCreator("add", "post"),
    verifyOtp: () => routeCreator("verify", "post"),
    resendOtp: () => routeCreator("resend", "post"),
  },
  bills: {
    check: () => routeCreator("check"),
    createBills: () => routeCreator("payment", "post"),
  },
};
