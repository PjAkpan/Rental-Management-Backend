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
  maintenance: {
    check: () => routeCreator("check"),
    createMaintenance: () => routeCreator("add", "post"),
    deleteMaintenance: () => routeCreator("delete/:id", "delete"),
    modifyMaintenance: () => routeCreator("update", "put"),
    viewSingleMaintenance: () => routeCreator("view/:id"),
    viewAllMaintenance: () => routeCreator("fetch/all"),
  },
  RentPayment: {
    check: () => routeCreator("check"),
    createTenancyPayment: () => routeCreator("add/tenancy", "post"),
    createRentPayment: () => routeCreator("add", "post"),
    deleteRentPayment: () => routeCreator("delete/:id", "delete"),
    modifyRentPayment: () => routeCreator("update", "put"),
    viewSingleRentPayment: () => routeCreator("view/:id"),
    viewAllRentPayment: () => routeCreator("fetch/all"),
    viewAllTenancyPayment: () => routeCreator("fetch/all/tenancy"),
    generateReceipt: () => routeCreator("generate/receipt/:requestId", "get"),
  },
  accountDetails: {
    check: () => routeCreator("check"),
    createAccountDetails: () => routeCreator("add", "post"),
    deleteAccountDetails: () => routeCreator("delete/:id", "delete"),
    modifyAccountDetails: () => routeCreator("update", "put"),
    viewSingleAccountDetails: () => routeCreator("view/:id"),
    viewAllAccountDetails: () => routeCreator("fetch/all"),
  },
};
