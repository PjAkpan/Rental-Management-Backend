"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path = require("path");
// Get service name and flags from command-line arguments
var serviceName = process.argv[2];
var capitalizedServiceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
if (!serviceName) {
    console.error("Please provide the service name as an argument.");
    process.exit(1);
}
var srcPath = path.resolve("src");
var controllersPath = path.join(srcPath, "controllers");
var modelsPath = path.join(srcPath, "models");
var urlsPath = path.join(srcPath, "constants");
var routersPath = path.join(srcPath, "routers");
var middlewaresPath = path.join(srcPath, "middlewares");
// Files for controllers and models
var controllerFile = {
    name: "".concat(serviceName, ".ts"),
    content: "import { HttpStatusCode, getters } from \"@config\";\nimport { logger } from \"netwrap\";\nimport { errorHandler, responseObject } from \"@utils\";\nimport type { RequestHandler } from \"express\";\nimport { ".concat(serviceName, "Model } from \"../models\";\nimport { Op } from \"sequelize\";\n\nconst checkServiceHealth: RequestHandler = (_req, res) => {\n  return responseObject({\n    res,\n    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,\n    statusCode: HttpStatusCode.OK,\n  });\n};\n\nconst add").concat(capitalizedServiceName, ": RequestHandler = async (req, res) => {\n  const { name } = req.body;\n  try {\n    const filter = { where: { name: { [Op.like]: `%${name}%` } } };\n    const check = await ").concat(serviceName, "Model.find").concat(capitalizedServiceName, "(filter);\n\n    if (check.status) {\n      return responseObject({ res, statusCode: HttpStatusCode.Conflict, message: check.message, payload: check.payload });\n    }\n\n    const create").concat(capitalizedServiceName, " = await ").concat(serviceName, "Model.save").concat(capitalizedServiceName, "({ name });\n    return responseObject({ res, statusCode: create").concat(capitalizedServiceName, ".statusCode, message: create").concat(capitalizedServiceName, ".message, payload: create").concat(capitalizedServiceName, ".payload });\n  } catch (err) {\n    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });\n  }\n};\n\nconst delete").concat(capitalizedServiceName, ": RequestHandler = async (req, res) => {\n  const { id } = req.params;\n  try {\n    const check = await ").concat(serviceName, "Model.find").concat(capitalizedServiceName, "ById(id);\n\n    if (!check.status) {\n      return responseObject({ res, statusCode: check.statusCode, message: check.message, payload: check.payload });\n    }\n\n    const delete").concat(capitalizedServiceName, " = await ").concat(serviceName, "Model.delete").concat(capitalizedServiceName, "ById(id);\n    return responseObject({ res, statusCode: delete").concat(capitalizedServiceName, ".statusCode, message: delete").concat(capitalizedServiceName, ".message, payload: delete").concat(capitalizedServiceName, ".payload });\n  } catch (err) {\n    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });\n  }\n};\n\nconst modify").concat(capitalizedServiceName, ": RequestHandler = async (req, res) => {\n  const { status, ").concat(capitalizedServiceName, "Id, ").concat(capitalizedServiceName, "Name } = req.body;\n  try {\n    const filter = { where: { id: ").concat(capitalizedServiceName, "Id } };\n    const check = await ").concat(serviceName, "Model.find").concat(capitalizedServiceName, "(filter);\n\n    if (!check.status) {\n      return responseObject({ res, statusCode: check.statusCode, message: check.message, payload: check.payload });\n    }\n\n    const updated").concat(capitalizedServiceName, " = await ").concat(serviceName, "Model.update").concat(capitalizedServiceName, "ById(").concat(capitalizedServiceName, "Id, { name: ").concat(capitalizedServiceName, "Name, isActive: status });\n    return responseObject({ res, statusCode: updated").concat(capitalizedServiceName, ".statusCode, message: updated").concat(capitalizedServiceName, ".message, payload: updated").concat(capitalizedServiceName, ".payload });\n  } catch (err) {\n    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });\n  }\n};\n\nconst fetchSingleInfo: RequestHandler = async (req, res) => {\n  const { id } = req.params;\n  try {\n    const check = await ").concat(serviceName, "Model.find").concat(capitalizedServiceName, "ById(id);\n    return responseObject({ res, statusCode: check.statusCode, message: check.message, payload: check.payload });\n  } catch (err) {\n    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });\n  }\n};\n\nconst fetchAll").concat(capitalizedServiceName, "s: RequestHandler = async (req, res) => {\n  const { orderBy = \"createdAt\", sort = \"DESC\", size, page } = req.query;\n  try {\n    const sizeNumber = parseInt(size as string) || 10;\n    const pageNumber = parseInt(page as string) || 1;\n    const filter = {\n      order: [[orderBy, sort]],\n      limit: sizeNumber,\n      offset: sizeNumber * (pageNumber - 1),\n    };\n    const response = await ").concat(serviceName, "Model.findAll(filter);\n\n    if (!response.status) {\n      return responseObject({ res, statusCode: response.statusCode, message: response.message, payload: response.payload });\n    }\n\n    const totalRecords = response.payload?.recordCount || 0;\n    const totalPages = Math.ceil(totalRecords / sizeNumber);\n    const payload = {\n      currentPage: pageNumber,\n      totalRecords,\n      totalPages,\n      data: response.payload?.allRecords,\n    };\n    return responseObject({ res, statusCode: HttpStatusCode.OK, message: \"Successfully fetched all records\", payload });\n  } catch (err) {\n    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });\n  }\n};\n\nexport {\n  checkServiceHealth,\n  add").concat(capitalizedServiceName, ",\n  modify").concat(capitalizedServiceName, ",\n  delete").concat(capitalizedServiceName, ",\n  fetchSingleInfo,\n  fetchAll").concat(capitalizedServiceName, "s,\n};"),
};
var modelFile = {
    name: "".concat(serviceName, ".ts"),
    content: "import { DataTypes } from \"sequelize\";\nimport { ".concat(serviceName, "ShemType } from \"./types\";\nimport { DBconnect, HttpStatusCode } from \"@config\";\n\nconst ").concat(capitalizedServiceName, "Schema = DBconnect.define(\n  \"tbl").concat(capitalizedServiceName, "\",\n  {\n    id: {\n      type: DataTypes.UUID,\n      defaultValue: DataTypes.UUIDV4,\n      allowNull: false,\n      primaryKey: true,\n    },\n    name: {\n      type: DataTypes.STRING,\n      allowNull: false,\n    },\n    isActive: {\n      type: DataTypes.BOOLEAN,\n      allowNull: true,\n      defaultValue: true,\n    },\n    // isDeleted: {\n    //   type: DataTypes.BOOLEAN,\n    //   allowNull: true,\n    //   defaultValue: false,\n    // },\n  },\n  {\n    tableName: \"tbl").concat(capitalizedServiceName, "\",\n    timestamps: true,\n    freezeTableName: true,\n  },\n);\n\n//").concat(capitalizedServiceName, "Schema.sync({alter:true});\n\nexport const ").concat(capitalizedServiceName, "Model = ").concat(capitalizedServiceName, "Schema;\n\n// Create a new ").concat(capitalizedServiceName, " entry\nexport const save").concat(capitalizedServiceName, " = async (data: Record<string, any>) => {\n  try {\n    const new").concat(capitalizedServiceName, " = await ").concat(capitalizedServiceName, "Model.create(data);\n    return {\n      status: true,\n      statusCode: HttpStatusCode.Created,\n      message: \"").concat(capitalizedServiceName, " created successfully\",\n      payload: new").concat(capitalizedServiceName, ",\n    };\n  } catch (err) {\n    console.error(\"Error creating ").concat(capitalizedServiceName, ":\", err);\n    return {\n      status: false,\n      statusCode: HttpStatusCode.InternalServerError,\n      message: (err as Error).message || \"Error creating ").concat(capitalizedServiceName, "\",\n      payload: null,\n    };\n  }\n};\n\n// Find a ").concat(capitalizedServiceName, " by any filter\nexport const find").concat(capitalizedServiceName, " = async (filter: Record<string, any>) => {\n  try {\n    filter.raw = true;\n    const ").concat(capitalizedServiceName, " = await ").concat(capitalizedServiceName, "Model.findOne(filter);\n    if (!").concat(capitalizedServiceName, ") {\n      return {\n        status: false,\n        statusCode: HttpStatusCode.NotFound,\n        message: \"").concat(capitalizedServiceName, " not found\",\n        payload: null,\n      };\n    }\n    return {\n      status: true,\n      statusCode: HttpStatusCode.OK,\n      message: \"").concat(capitalizedServiceName, " found\",\n      payload: ").concat(capitalizedServiceName, ",\n    };\n  } catch (err) {\n    console.error(\"Error finding ").concat(capitalizedServiceName, ":\", err);\n    return {\n      status: false,\n      statusCode: HttpStatusCode.InternalServerError,\n      message: (err as Error).message || \"Error finding ").concat(capitalizedServiceName, "\",\n      payload: null,\n    };\n  }\n};\n\n// Find all ").concat(capitalizedServiceName, "s\nexport const findAll = async (filter: any) => {\n  try {\n    console.log(filter);\n\n    const [allRecords, recordCount] = await Promise.all([\n      ").concat(capitalizedServiceName, "Model.findAll(filter),\n      ").concat(capitalizedServiceName, "Model.count({\n        where: filter.where,\n      }),\n    ]);\n    if (!allRecords || allRecords.length === 0) {\n      return {\n        status: false,\n        statusCode: HttpStatusCode.NotFound,\n        message: \"").concat(capitalizedServiceName, " not found\",\n        payload: null,\n      };\n    }\n\n    return {\n      status: true,\n      statusCode: HttpStatusCode.OK,\n      message: \"").concat(capitalizedServiceName, "s retrieved successfully\",\n      payload: { allRecords, recordCount },\n    };\n  } catch (err) {\n    console.error(\"Error retrieving ").concat(capitalizedServiceName, "s:\", err);\n    return {\n      status: false,\n      statusCode: HttpStatusCode.InternalServerError,\n      message: \"Error retrieving ").concat(capitalizedServiceName, "s\",\n      error: (err as Error).message || \"Error retrieving ").concat(capitalizedServiceName, "s\",\n    };\n  }\n};\n\n// Find a ").concat(capitalizedServiceName, " by ID\nexport const find").concat(capitalizedServiceName, "ById = async (id: string) => {\n  try {\n    const ").concat(capitalizedServiceName, " = await ").concat(capitalizedServiceName, "Model.findByPk(id);\n    if (!").concat(capitalizedServiceName, ") {\n      return {\n        status: false,\n        statusCode: HttpStatusCode.NotFound,\n        message: \"").concat(capitalizedServiceName, " not found\",\n        payload: null,\n      };\n    }\n    return {\n      status: true,\n      statusCode: HttpStatusCode.OK,\n      message: \"").concat(capitalizedServiceName, " found\",\n      payload: ").concat(capitalizedServiceName, ",\n    };\n  } catch (err) {\n    console.error(\"Error finding ").concat(capitalizedServiceName, " by ID:\", err);\n    return {\n      status: false,\n      statusCode: HttpStatusCode.InternalServerError,\n      message: (err as Error).message || \"Error finding ").concat(capitalizedServiceName, "\",\n      payload: null,\n    };\n  }\n};\n\n// Update a ").concat(capitalizedServiceName, " by ID\nexport const update").concat(capitalizedServiceName, "ById = async (\n  id: string,\n  updateData: Partial<").concat(serviceName, "ShemType>,\n) => {\n  try {\n    const [rowsUpdated, [updated").concat(capitalizedServiceName, "]] = await ").concat(capitalizedServiceName, "Model.update(updateData, {\n      where: { id },\n      returning: true, // To return the updated record\n    });\n    if (rowsUpdated === 0) {\n      return {\n        status: false,\n        statusCode: HttpStatusCode.NotFound,\n        message: \"No ").concat(capitalizedServiceName, " records found to update\",\n        payload: null,\n      };\n    }\n    return {\n      status: true,\n      statusCode: HttpStatusCode.OK,\n      message: \"").concat(capitalizedServiceName, " updated successfully\",\n      payload: updated").concat(capitalizedServiceName, ",\n    };\n  } catch (err) {\n    console.error(\"Error updating ").concat(capitalizedServiceName, ":\", err);\n    return {\n      status: false,\n      statusCode: HttpStatusCode.InternalServerError,\n      message: (err as Error).message || \"Error updating ").concat(capitalizedServiceName, "\",\n      payload: null,\n    };\n  }\n};\n\n// Delete a ").concat(capitalizedServiceName, " by ID\nexport const delete").concat(capitalizedServiceName, "ById = async (id: string) => {\n  try {\n    const deleted").concat(capitalizedServiceName, " = await ").concat(capitalizedServiceName, "Model.destroy({ where: { id } });\n    if (!deleted").concat(capitalizedServiceName, ") {\n      return {\n        status: false,\n        statusCode: HttpStatusCode.NotFound,\n        message: \"").concat(capitalizedServiceName, " not found\",\n        payload: null,\n      };\n    }\n    return {\n      status: true,\n      statusCode: HttpStatusCode.OK,\n      message: \"").concat(capitalizedServiceName, " deleted successfully\",\n      payload: null,\n    };\n  } catch (err) {\n    console.error(\"Error deleting ").concat(capitalizedServiceName, ":\", err);\n    return {\n      status: false,\n      statusCode: HttpStatusCode.InternalServerError,\n      message: (err as Error).message || \"Error deleting ").concat(capitalizedServiceName, "\",\n      payload: null,\n    };\n  }\n};"),
};
var modelTypes = {
    name: "types.ts",
    content: "import { Helpers } from \"../types\";\nimport { Model } from \"sequelize\";\n\nexport type ".concat(serviceName, "ShemType = {\n  Id?: string;\n  name: \"ordinaryuser\" | \"backend\" | \"superadmin\";\n  status: string;\n  isActive: boolean;\n} & Model & Helpers.Timestamps;\n\nexport type FindInfoParams = {\n  orderBy?: string;\n  sort?: \"ASC\" | \"DESC\";\n  size?: number;\n  page?: number;\n  gSearch?: string;\n  filter?: Record<string, any>;\n  status?: string;\n  option?: string;\n  startDate?: string;\n  endDate?: string;\n};"),
};
var urlsFile = {
    name: "urls.ts",
    content: " ".concat(serviceName, ": {\n    check: () => routeCreator(\"check\"),\n    create").concat(capitalizedServiceName, ": () => routeCreator(\"add\", \"post\"),\n    delete").concat(capitalizedServiceName, ": () => routeCreator(\"delete/:id\", \"delete\"),\n    modify").concat(capitalizedServiceName, ": () => routeCreator(\"update\", \"put\"),\n    viewSingle").concat(capitalizedServiceName, ": () => routeCreator(\"view/:id\"),\n    viewAll").concat(capitalizedServiceName, ": () => routeCreator(\"fetch/all\"),\n  }, "),
};
var routersFile = {
    name: "".concat(serviceName, ".ts"),
    content: "import { constants } from \"@constants\";\nimport { RouteHandler } from \"src/types/route\";\nimport { joinUrls } from \"@utils\";\nimport controllers from \"@controllers\";\nimport { verifyMiddleware } from \"src/middlewares\";\n\nconst serviceLoader: RouteHandler[] = [\n  {\n    path: joinUrls([constants.urls.".concat(serviceName, ".check().path]),\n    method: constants.urls.").concat(serviceName, ".check().method,\n    handlers: [controllers.").concat(serviceName, ".checkServiceHealth],\n  },\n   {\n    path: joinUrls([constants.urls.").concat(serviceName, ".create").concat(capitalizedServiceName, "().path]),\n    method: constants.urls.").concat(serviceName, ".create").concat(capitalizedServiceName, "().method,\n    handlers: [verifyMiddleware.validateCreate").concat(capitalizedServiceName, "Request, controllers.").concat(serviceName, ".add").concat(capitalizedServiceName, "],\n  },\n   {\n    path: joinUrls([constants.urls.").concat(serviceName, ".delete").concat(capitalizedServiceName, "().path]),\n    method: constants.urls.").concat(serviceName, ".delete").concat(capitalizedServiceName, "().method,\n    handlers: [controllers.").concat(serviceName, ".delete").concat(capitalizedServiceName, "],\n  },\n   {\n    path: joinUrls([constants.urls.").concat(serviceName, ".modify").concat(capitalizedServiceName, "().path]),\n    method: constants.urls.").concat(serviceName, ".modify").concat(capitalizedServiceName, "().method,\n    handlers: [\n      verifyMiddleware.update").concat(capitalizedServiceName, "InputRequest,\n      controllers.").concat(serviceName, ".modify").concat(capitalizedServiceName, ",\n    ],\n  },\n  {\n    path: joinUrls([constants.urls.").concat(serviceName, ".viewSingle").concat(capitalizedServiceName, "().path]),\n    method: constants.urls.").concat(serviceName, ".viewSingle").concat(capitalizedServiceName, "().method,\n    handlers: [controllers.").concat(serviceName, ".fetchSingleInfo],\n  },\n  {\n    path: joinUrls([constants.urls.").concat(serviceName, ".viewAll").concat(capitalizedServiceName, "().path]),\n    method: constants.urls.").concat(serviceName, ".viewAll").concat(capitalizedServiceName, "().method,\n    handlers: [\n      verifyMiddleware.validateVeiwAllInput,\n      controllers.").concat(serviceName, ".fetchAll").concat(capitalizedServiceName, "s,\n    ],\n  },\n\n];\n\nexport default serviceLoader;\n"),
};
var verifyMiddlewareFile = {
    name: "verifyMiddleware.ts",
    content: "const update".concat(capitalizedServiceName, "InputRequest = createValidationMiddleware(update").concat(capitalizedServiceName, "InputValidation);\nconst validateCreate").concat(capitalizedServiceName, "Request = createValidationMiddleware(add").concat(capitalizedServiceName, "InputValidation);  const verifyMiddleware = {validateCreate").concat(capitalizedServiceName, "Request,\nupdate").concat(capitalizedServiceName, "InputRequest,};"),
};
// Update index files for controllers and models
function updateIndexFile(filePath, importStatement, exportKey) {
    return __awaiter(this, void 0, void 0, function () {
        var data, importPattern, exportPattern, allImports, exportMatches, exportEntries, updatedData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fs_1.promises.readFile(filePath, "utf-8")];
                case 1:
                    data = _a.sent();
                    importPattern = /import.*from\s+".*";/g;
                    exportPattern = /export\s+default\s+{([\s\S]*?)};/;
                    allImports = data.match(importPattern) || [];
                    exportMatches = data.match(exportPattern);
                    // Add the new import statement if not already present
                    if (!allImports.includes(importStatement)) {
                        allImports.push(importStatement);
                    }
                    // Sort imports alphabetically
                    allImports.sort();
                    exportEntries = exportMatches && exportMatches[1]
                        ? exportMatches[1]
                            .split(",")
                            .map(function (entry) { return entry.trim(); })
                            .filter(Boolean)
                        : [];
                    // Add the new export entry if not already present
                    if (!exportEntries.some(function (entry) { return entry.startsWith("".concat(exportKey, ":")); })) {
                        exportEntries.push("".concat(exportKey, ": ").concat(exportKey, "Controller"));
                    }
                    // Sort export entries alphabetically
                    exportEntries.sort();
                    updatedData = "\n".concat(allImports.join("\n"), "\n\nexport default {\n  ").concat(exportEntries.join(",\n  "), "\n};\n");
                    // Write the updated content back to the index file
                    return [4 /*yield*/, fs_1.promises.writeFile(filePath, updatedData.trim(), "utf-8")];
                case 2:
                    // Write the updated content back to the index file
                    _a.sent();
                    console.log("Updated ".concat(filePath, " successfully with sorted imports and exports."));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error updating ".concat(filePath, ":"), error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function updateModelIndexFile(filePath, importStatement, modelName) {
    return __awaiter(this, void 0, void 0, function () {
        var data, importPattern, exportPattern, allImports, exportMatches, exportEntries, updatedData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fs_1.promises.readFile(filePath, "utf-8")];
                case 1:
                    data = _a.sent();
                    importPattern = /import\s\* as .* from ".\/.*";/g;
                    exportPattern = /export\s*{\s*([\s\S]*?)\s*};/;
                    allImports = data.match(importPattern) || [];
                    exportMatches = data.match(exportPattern);
                    // Add the new import if it doesn't exist already
                    if (!allImports.includes(importStatement)) {
                        allImports.push(importStatement);
                    }
                    // Sort imports alphabetically
                    allImports.sort();
                    exportEntries = exportMatches && exportMatches[1]
                        ? exportMatches[1]
                            .split(",")
                            .map(function (entry) { return entry.trim(); })
                            .filter(Boolean)
                        : [];
                    // Add the new model export if it doesn't exist
                    if (!exportEntries.includes("".concat(modelName, "Model"))) {
                        exportEntries.push("".concat(modelName, "Model"));
                    }
                    // Sort export entries alphabetically
                    exportEntries.sort();
                    updatedData = "\n".concat(allImports.join("\n"), "\n\n// Export all models\nexport { ").concat(exportEntries.join(", "), " };\n");
                    // Write the updated content back to the index file
                    return [4 /*yield*/, fs_1.promises.writeFile(filePath, updatedData.trim(), "utf-8")];
                case 2:
                    // Write the updated content back to the index file
                    _a.sent();
                    console.log("Updated ".concat(filePath, " successfully with sorted model imports and exports."));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error updating ".concat(filePath, ":"), error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function appendRoutesToUrls(urlsPath, newServiceRoutes) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, content, fileExists, err_1, exportStart, closingBraceIndex, updatedContent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = path.join(urlsPath, "urls.ts");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    content = "";
                    fileExists = true;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs_1.promises.readFile(filePath, "utf8")];
                case 3:
                    content = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    if (err_1.code === "ENOENT") {
                        // File does not exist; create with initial structure
                        fileExists = false;
                        content = "import { routeCreator } from \"@utils\";\n\nexport const urls = {\n  health: {\n    check: () => routeCreator(\"check\"),\n  },\n};\n";
                    }
                    else {
                        throw err_1; // Re-throw other errors
                    }
                    return [3 /*break*/, 5];
                case 5:
                    if (!!fileExists) return [3 /*break*/, 7];
                    // Write the initial content to urls.ts
                    return [4 /*yield*/, fs_1.promises.writeFile(filePath, content, "utf8")];
                case 6:
                    // Write the initial content to urls.ts
                    _a.sent();
                    console.log("Created new URLs file: urls.ts");
                    _a.label = 7;
                case 7:
                    // Ensure the import statement exists
                    if (!content.includes('import { routeCreator } from "@utils";')) {
                        content = "import { routeCreator } from \"@utils\";\n\n" + content;
                    }
                    exportStart = content.indexOf("export const urls = {");
                    if (exportStart === -1) {
                        throw new Error("Cannot find 'export const urls = {' in urls.ts");
                    }
                    closingBraceIndex = content.lastIndexOf("};");
                    if (closingBraceIndex === -1) {
                        throw new Error("Cannot find closing '};' in urls.ts");
                    }
                    // Check if the service routes already exist to prevent duplicates
                    if (content.includes("".concat(serviceName, ": {"))) {
                        console.log("Routes for service '".concat(serviceName, "' already exist in urls.ts"));
                        return [2 /*return*/];
                    }
                    updatedContent = content.slice(0, closingBraceIndex) +
                        newServiceRoutes +
                        "\n" +
                        content.slice(closingBraceIndex);
                    // Write back the updated content to urls.ts
                    return [4 /*yield*/, fs_1.promises.writeFile(filePath, updatedContent, "utf8")];
                case 8:
                    // Write back the updated content to urls.ts
                    _a.sent();
                    console.log("Appended routes for '".concat(serviceName, "' to urls.ts"));
                    return [3 /*break*/, 10];
                case 9:
                    error_3 = _a.sent();
                    console.error("Error updating urls.ts:", error_3);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function appendMiddlewareValidations(middlewaresPath, serviceName) {
    return __awaiter(this, void 0, void 0, function () {
        var verifyMiddlewarePath, content, newValidationName, importSection, lastConstDefinition, verifyMiddlewareDefinition, newImports, updatedImports, newMiddlewareDefinitions, verifyMiddlewareContent, updatedVerifyMiddleware, finalContent;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    verifyMiddlewarePath = path.join(middlewaresPath, "verifyMiddleware.ts");
                    return [4 /*yield*/, fs_1.promises.readFile(verifyMiddlewarePath, "utf-8")];
                case 1:
                    content = _b.sent();
                    newValidationName = "add".concat(serviceName, "InputValidation");
                    if (content.includes(newValidationName)) {
                        console.log("Validations for ".concat(serviceName, " already exist. Skipping..."));
                        return [2 /*return*/];
                    }
                    importSection = ((_a = content.match(/import \{[\s\S]*?\} from "\.\.\/utils\/validate";/)) === null || _a === void 0 ? void 0 : _a[0]) ||
                        "";
                    lastConstDefinition = content.lastIndexOf("const validateVeiwAllInput");
                    verifyMiddlewareDefinition = content.indexOf("const verifyMiddleware = {");
                    newImports = "add".concat(serviceName, "InputValidation,\n  update").concat(serviceName, "InputValidation,");
                    updatedImports = importSection.replace('} from "../utils/validate";', "".concat(newImports, "\n} from \"../utils/validate\";"));
                    newMiddlewareDefinitions = "\n\nconst validateCreate".concat(capitalizedServiceName, "Request = createValidationMiddleware(\n  add").concat(serviceName, "InputValidation,\n  \"body\"\n);\n\nconst update").concat(capitalizedServiceName, "InputRequest = createValidationMiddleware(\n  update").concat(serviceName, "InputValidation,\n  \"body\"\n);");
                    verifyMiddlewareContent = content.slice(verifyMiddlewareDefinition, content.indexOf("};", verifyMiddlewareDefinition) + 2);
                    updatedVerifyMiddleware = verifyMiddlewareContent.replace("};", "validateCreate".concat(capitalizedServiceName, "Request,\n  update").concat(capitalizedServiceName, "InputRequest,\n};"));
                    finalContent = content.slice(0, content.indexOf(importSection)) +
                        updatedImports +
                        content.slice(content.indexOf(importSection) + importSection.length, lastConstDefinition) +
                        content.slice(lastConstDefinition, verifyMiddlewareDefinition) +
                        newMiddlewareDefinitions +
                        "\n" +
                        updatedVerifyMiddleware +
                        "\n\nexport { verifyMiddleware };";
                    // Write the updated content back to the file
                    return [4 /*yield*/, fs_1.promises.writeFile(verifyMiddlewarePath, finalContent)];
                case 2:
                    // Write the updated content back to the file
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function createService() {
    return __awaiter(this, void 0, void 0, function () {
        var controllerImport, modelImport, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, , 15]);
                    // Ensure the necessary folders exist
                    return [4 /*yield*/, fs_1.promises.mkdir(controllersPath, { recursive: true })];
                case 1:
                    // Ensure the necessary folders exist
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.mkdir(modelsPath, { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.mkdir(urlsPath, { recursive: true })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.mkdir(routersPath, { recursive: true })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.mkdir(middlewaresPath, { recursive: true })];
                case 5:
                    _a.sent();
                    // Write controller and model files
                    return [4 /*yield*/, fs_1.promises.writeFile(path.join(controllersPath, controllerFile.name), controllerFile.content)];
                case 6:
                    // Write controller and model files
                    _a.sent();
                    console.log("Created controller file: ".concat(controllerFile.name));
                    return [4 /*yield*/, fs_1.promises.writeFile(path.join(modelsPath, modelFile.name), modelFile.content)];
                case 7:
                    _a.sent();
                    console.log("Created model file: ".concat(modelFile.name));
                    return [4 /*yield*/, fs_1.promises.writeFile(path.join(modelsPath, modelTypes.name), modelTypes.content)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, appendRoutesToUrls(path.join(urlsPath), urlsFile.content.trim())];
                case 9:
                    _a.sent();
                    console.log("Created URL file: ".concat(urlsFile.name));
                    return [4 /*yield*/, fs_1.promises.writeFile(path.join(routersPath, routersFile.name), routersFile.content)];
                case 10:
                    _a.sent();
                    console.log("Created router file: ".concat(routersFile.name));
                    controllerImport = "import * as ".concat(serviceName, "Controller from \"./").concat(serviceName, "\";");
                    return [4 /*yield*/, updateIndexFile(path.join(controllersPath, "index.ts"), controllerImport, serviceName)];
                case 11:
                    _a.sent();
                    modelImport = "import * as ".concat(serviceName, "Model from \"./").concat(serviceName, "\";");
                    return [4 /*yield*/, updateModelIndexFile(path.join(modelsPath, "index.ts"), modelImport, serviceName)];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, appendMiddlewareValidations(middlewaresPath, serviceName)];
                case 13:
                    _a.sent();
                    console.log("Service module '".concat(serviceName, "' generated successfully!"));
                    return [3 /*break*/, 15];
                case 14:
                    error_4 = _a.sent();
                    console.error("Error creating service module:", error_4);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Run the service creation
createService();
