import { promises as fs } from "fs";
import * as path from "path";

// Get service name and flags from command-line arguments
const serviceName = process.argv[2];
const capitalizedServiceName =
  serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

if (!serviceName) {
  console.error("Please provide the service name as an argument.");
  process.exit(1);
}

const srcPath = path.resolve("src");
const controllersPath = path.join(srcPath, "controllers");
const modelsPath = path.join(srcPath, "models");
const urlsPath = path.join(srcPath, "constants");
const routersPath = path.join(srcPath, "routers");
const middlewaresPath = path.join(srcPath, "middlewares");

// Files for controllers and models
const controllerFile = {
  name: `${serviceName}.ts`,
  content: `import { HttpStatusCode, getters } from "../config";
import { logger } from "netwrap";
import {addIfNotEmpty, errorHandler, responseObject } from "../utils";
import type { RequestHandler } from "express";
import { ${serviceName}Model } from "../models";
import { Op } from "sequelize";

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const add${capitalizedServiceName}: RequestHandler = async (req, res) => {
  const { name } = req.body;
  try {
    const filter = { where: { name: { [Op.like]: \`%\${name}%\` } } };
    const check = await ${serviceName}Model.find${capitalizedServiceName}(filter);

    if (check.status) {
      return responseObject({ res, statusCode: HttpStatusCode.Conflict, message: check.message, payload: check.payload });
    }

    const create${capitalizedServiceName} = await ${serviceName}Model.save${capitalizedServiceName}({ name });
    return responseObject({ res, statusCode: create${capitalizedServiceName}.statusCode, message: create${capitalizedServiceName}.message, payload: create${capitalizedServiceName}.payload });
  } catch (err) {
    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });
  }
};

const delete${capitalizedServiceName}: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await ${serviceName}Model.find${capitalizedServiceName}ById(id);

    if (!check.status) {
      return responseObject({ res, statusCode: check.statusCode, message: check.message, payload: check.payload });
    }

    const delete${capitalizedServiceName} = await ${serviceName}Model.delete${capitalizedServiceName}ById(id);
    return responseObject({ res, statusCode: delete${capitalizedServiceName}.statusCode, message: delete${capitalizedServiceName}.message, payload: delete${capitalizedServiceName}.payload });
  } catch (err) {
    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });
  }
};

const modify${capitalizedServiceName}: RequestHandler = async (req, res) => {
  const { status, ${capitalizedServiceName}Id, ${capitalizedServiceName}Name } = req.body;
  let payload: any = {};
   try {
    const filter = { where: { id: ${capitalizedServiceName}Id } };
    const check = await ${serviceName}Model.find${capitalizedServiceName}(filter);

    if (!check.status) {
      return responseObject({ res, statusCode: check.statusCode, message: check.message, payload: check.payload });
    }
 addIfNotEmpty(payload, "description", description);
    addIfNotEmpty(payload, "subject", subject);
    addIfNotEmpty(payload, "userId", userId);
    const updated${capitalizedServiceName} = await ${serviceName}Model.update${capitalizedServiceName}ById(${capitalizedServiceName}Id, payload);
    return responseObject({ res, statusCode: updated${capitalizedServiceName}.statusCode, message: updated${capitalizedServiceName}.message, payload: updated${capitalizedServiceName}.payload });
  } catch (err) {
    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });
  }
};

const fetchSingleInfo: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await ${serviceName}Model.find${capitalizedServiceName}ById(id);
    return responseObject({ res, statusCode: check.statusCode, message: check.message, payload: check.payload });
  } catch (err) {
    return responseObject({ res, statusCode: HttpStatusCode.InternalServerError, message: errorHandler(err, null).message });
  }
};

const fetchAll${capitalizedServiceName}s: RequestHandler = async (req, res) => {
  const {
    orderBy = "createdAt",
    sort = "DESC",
    size,
    page,
    startDate,
    endDate,
  }: FindInfoParams = req.query;
  let { gSearch, option }: any = req.query;
  let statusCode = 503;
  let message =
    "A critical error occurred. Kindly contact admin for details about a possible solution to this error";
  let payload = null;
  const columnMapping: any = {
    STATUS: "roomStatus",
    ROOMNUMBER: "roomNumber",
  };
  try {
   
    const sizeNumber = size ? parseInt(size as unknown as string) : 10;
    const pageNumber = page ? parseInt(page as unknown as string) : 1;
    const filter: {
      order: string[][];
      limit: number;
      offset: number;
      attributes: {
        exclude: string[];
      };
      where: Record<string, any>;
    } = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
      attributes: {
        exclude: ["updatedAt"], 
      },
      where: {},
    };

    
    gSearch = Array.isArray(gSearch) ? gSearch : [gSearch];
    option = Array.isArray(option) ? option : [option];

   
    gSearch.forEach((searchValue: any, index: string | number) => {
      const opt = option[index] || option[0]; 
      const sanitizedSearchValue = searchValue;
      const sanitizedOption: any = sanitizeInput(opt || "");

     
      const columnName = columnMapping[sanitizedOption.toUpperCase()];

      
      const exactMatchColumns = ["isActive", "roomNumber"];

    
      if (sanitizedSearchValue && sanitizedOption) {
        if (columnName) {
          
          if (exactMatchColumns.includes(columnName)) {
            filter.where[columnName] = { [Op.eq]: sanitizedSearchValue };
          } else {
            filter.where[columnName] = {
              [Op.like]: '%{sanitizedSearchValue}%',
            };
          }
        } else {
        
          throw createHttpError("Invalid search option provided", 404);
        }
      }
    });
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filter.where.createdAt = {
        [Op.between]: [start, end],
      };
    }
    logger(filter);
    const response = await ${serviceName}Model.findAll(filter);
    message = response.message;
    payload = response.payload;
    statusCode = response.statusCode;
    if (!response.status) {
      return responseObject({
        res,
        statusCode,
        message,
        payload,
      });
    }

    const totalRecords = response.payload?.recordCount || 0;
    const totalPages = Math.ceil(totalRecords / sizeNumber);
    payload = {
      currentPage: pageNumber,
      totalRecords,
      totalPages,
      data: response.payload?.allRecords,
    };
    message = "Successfully fetched all records";
    return responseObject({
      res,
      statusCode: HttpStatusCode.OK,
      message,
      payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

export {
  checkServiceHealth,
  add${capitalizedServiceName},
  modify${capitalizedServiceName},
  delete${capitalizedServiceName},
  fetchSingleInfo,
  fetchAll${capitalizedServiceName}s,
};`,
};

const modelFile = {
  name: `${serviceName}.ts`,
  content: `import { DataTypes } from "sequelize";
import { ${serviceName}ShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";
import { FindOptions } from "sequelize";

const ${capitalizedServiceName}Schema = DBconnect.define(
  "tbl${capitalizedServiceName}",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: "tbl${capitalizedServiceName}",
    timestamps: true,
    freezeTableName: true,
  },
);

//${capitalizedServiceName}Schema.sync({alter:true});

export const ${capitalizedServiceName}Model = ${capitalizedServiceName}Schema;

// Create a new ${capitalizedServiceName} entry
export const save${capitalizedServiceName} = async (data: Record<string, unknown>) => {
  try {
    const new${capitalizedServiceName} = await ${capitalizedServiceName}Model.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "${capitalizedServiceName} created successfully",
      payload: new${capitalizedServiceName},
    };
  } catch (err) {
    console.error("Error creating ${capitalizedServiceName}:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating ${capitalizedServiceName}",
      payload: null,
    };
  }
};

// Find a ${capitalizedServiceName} by any filter
export const find${capitalizedServiceName} = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const ${capitalizedServiceName} = await ${capitalizedServiceName}Model.findOne(filter);
    if (!${capitalizedServiceName}) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "${capitalizedServiceName} not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "${capitalizedServiceName} found",
      payload: ${capitalizedServiceName},
    };
  } catch (err) {
    console.error("Error finding ${capitalizedServiceName}:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding ${capitalizedServiceName}",
      payload: null,
    };
  }
};

// Find all ${capitalizedServiceName}s
export const findAll = async (filter: any) => {
  try {

    const [allRecords, recordCount] = await Promise.all([
      ${capitalizedServiceName}Model.findAll(filter),
      ${capitalizedServiceName}Model.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "${capitalizedServiceName} not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "${capitalizedServiceName}s retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    console.error("Error retrieving ${capitalizedServiceName}s:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving ${capitalizedServiceName}s",
      error: (err as Error).message || "Error retrieving ${capitalizedServiceName}s",
    };
  }
};

// Find a ${capitalizedServiceName} by ID
export const find${capitalizedServiceName}ById = async (id: string) => {
  try {
    const ${capitalizedServiceName} = await ${capitalizedServiceName}Model.findByPk(id);
    if (!${capitalizedServiceName}) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "${capitalizedServiceName} not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "${capitalizedServiceName} found",
      payload: ${capitalizedServiceName},
    };
  } catch (err) {
    console.error("Error finding ${capitalizedServiceName} by ID:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding ${capitalizedServiceName}",
      payload: null,
    };
  }
};

// Update a ${capitalizedServiceName} by ID
export const update${capitalizedServiceName}ById = async (
    id: string | undefined,
  updateData: Partial<${serviceName}ShemType>,
) => {
  try {
    const [rowsUpdated, [updated${capitalizedServiceName}]] = await ${capitalizedServiceName}Model.update(updateData, {
      where: { id },
      returning: true, // To return the updated record
    });
    if (rowsUpdated === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No ${capitalizedServiceName} records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "${capitalizedServiceName} updated successfully",
      payload: updated${capitalizedServiceName},
    };
  } catch (err) {
    console.error("Error updating ${capitalizedServiceName}:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating ${capitalizedServiceName}",
      payload: null,
    };
  }
};

// Delete a ${capitalizedServiceName} by ID
export const delete${capitalizedServiceName}ById = async (id: string) => {
  try {
    const deleted${capitalizedServiceName} = await ${capitalizedServiceName}Model.destroy({ where: { id } });
    if (!deleted${capitalizedServiceName}) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "${capitalizedServiceName} not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "${capitalizedServiceName} deleted successfully",
      payload: null,
    };
  } catch (err) {
    console.error("Error deleting ${capitalizedServiceName}:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting ${capitalizedServiceName}",
      payload: null,
    };
  }
};`,
};

const modelTypes = {
  name: "types.ts",
  content: `import { Helpers } from "../types";\nimport { Model } from "sequelize";\n\nexport type ${serviceName}ShemType = {\n  Id?: string;\n  name: "ordinaryuser" | "backend" | "superadmin";\n  status: string;\n  isActive: boolean;\n} & Model & Helpers.Timestamps;\n\nexport type FindInfoParams = {\n  orderBy?: string;\n  sort?: "ASC" | "DESC";\n  size?: number;\n  page?: number;\n  gSearch?: string;\n  filter?: Record<string, any>;\n  status?: string;\n  option?: string;\n  startDate?: string;\n  endDate?: string;\n};`,
};

const urlsFile = {
  name: "urls.ts",
  content: ` ${serviceName}: {
    check: () => routeCreator("check"),
    create${capitalizedServiceName}: () => routeCreator("add", "post"),
    delete${capitalizedServiceName}: () => routeCreator("delete/:id", "delete"),
    modify${capitalizedServiceName}: () => routeCreator("update", "put"),
    viewSingle${capitalizedServiceName}: () => routeCreator("view/:id"),
    viewAll${capitalizedServiceName}: () => routeCreator("fetch/all"),
  }, `,
};

const routersFile = {
  name: `${serviceName}.ts`,
  content: `import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.${serviceName}.check().path]),
    method: constants.urls.${serviceName}.check().method,
    handlers: [controllers.${serviceName}.checkServiceHealth],
  },
   {
    path: joinUrls([constants.urls.${serviceName}.create${capitalizedServiceName}().path]),
    method: constants.urls.${serviceName}.create${capitalizedServiceName}().method,
    handlers: [verifyMiddleware.validateCreate${capitalizedServiceName}Request, controllers.${serviceName}.add${capitalizedServiceName}],
  },
   {
    path: joinUrls([constants.urls.${serviceName}.delete${capitalizedServiceName}().path]),
    method: constants.urls.${serviceName}.delete${capitalizedServiceName}().method,
    handlers: [controllers.${serviceName}.delete${capitalizedServiceName}],
  },
   {
    path: joinUrls([constants.urls.${serviceName}.modify${capitalizedServiceName}().path]),
    method: constants.urls.${serviceName}.modify${capitalizedServiceName}().method,
    handlers: [
      verifyMiddleware.update${capitalizedServiceName}InputRequest,
      controllers.${serviceName}.modify${capitalizedServiceName},
    ],
  },
  {
    path: joinUrls([constants.urls.${serviceName}.viewSingle${capitalizedServiceName}().path]),
    method: constants.urls.${serviceName}.viewSingle${capitalizedServiceName}().method,
    handlers: [controllers.${serviceName}.fetchSingleInfo],
  },
  {
    path: joinUrls([constants.urls.${serviceName}.viewAll${capitalizedServiceName}().path]),
    method: constants.urls.${serviceName}.viewAll${capitalizedServiceName}().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.${serviceName}.fetchAll${capitalizedServiceName}s,
    ],
  },

];

export default serviceLoader;
`,
};

const verifyMiddlewareFile = {
  name: "verifyMiddleware.ts",
  content: `const update${capitalizedServiceName}InputRequest = createValidationMiddleware(update${capitalizedServiceName}InputValidation);
const validateCreate${capitalizedServiceName}Request = createValidationMiddleware(add${capitalizedServiceName}InputValidation); \ const verifyMiddleware = {validateCreate${capitalizedServiceName}Request,\nupdate${capitalizedServiceName}InputRequest,};`,
};

// Update index files for controllers and models
async function updateIndexFile(
  filePath: string,
  importStatement: string,
  exportKey: string,
) {
  try {
    let data = await fs.readFile(filePath, "utf-8");

    // Extract existing imports and export object
    const importPattern = /import.*from\s+".*";/g;
    const exportPattern = /export\s+default\s+{([\s\S]*?)};/;
    const allImports: string[] = data.match(importPattern) || [];
    const exportMatches = data.match(exportPattern);

    // Add the new import statement if not already present
    if (!allImports.includes(importStatement)) {
      allImports.push(importStatement);
    }

    // Sort imports alphabetically
    allImports.sort();

    // Prepare export entries as key-value pairs
    let exportEntries =
      exportMatches && exportMatches[1]
        ? exportMatches[1]
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [];

    // Add the new export entry if not already present
    if (!exportEntries.some((entry) => entry.startsWith(`${exportKey}:`))) {
      exportEntries.push(`${exportKey}: ${exportKey}Controller`);
    }

    // Sort export entries alphabetically
    exportEntries.sort();

    // Build the updated content
    const updatedData = `
${allImports.join("\n")}

export default {
  ${exportEntries.join(",\n  ")}
};
`;

    // Write the updated content back to the index file
    await fs.writeFile(filePath, updatedData.trim(), "utf-8");
    console.log(
      `Updated ${filePath} successfully with sorted imports and exports.`,
    );
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

async function updateModelIndexFile(
  filePath: string,
  importStatement: string,
  modelName: string,
) {
  try {
    let data = await fs.readFile(filePath, "utf-8");

    // Define import and export patterns for models
    const importPattern = /import\s\* as .* from ".\/.*";/g;
    const exportPattern = /export\s*{\s*([\s\S]*?)\s*};/;

    // Collect all existing imports and specify type as string[]
    const allImports: string[] = data.match(importPattern) || [];
    const exportMatches = data.match(exportPattern);

    // Add the new import if it doesn't exist already
    if (!allImports.includes(importStatement)) {
      allImports.push(importStatement);
    }

    // Sort imports alphabetically
    allImports.sort();

    // Prepare export entries
    let exportEntries =
      exportMatches && exportMatches[1]
        ? exportMatches[1]
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [];

    // Add the new model export if it doesn't exist
    if (!exportEntries.includes(`${modelName}Model`)) {
      exportEntries.push(`${modelName}Model`);
    }

    // Sort export entries alphabetically
    exportEntries.sort();

    // Rebuild the index file content with sorted imports and exports
    const updatedData = `
${allImports.join("\n")}

// Export all models
export { ${exportEntries.join(", ")} };
`;

    // Write the updated content back to the index file
    await fs.writeFile(filePath, updatedData.trim(), "utf-8");
    console.log(
      `Updated ${filePath} successfully with sorted model imports and exports.`,
    );
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

async function appendRoutesToUrls(urlsPath: string, newServiceRoutes: string) {
  const filePath = path.join(urlsPath, "urls.ts");

  try {
    let content = "";
    let fileExists = true;

    // Check if urls.ts exists
    try {
      content = await fs.readFile(filePath, "utf8");
    } catch (err: any) {
      if (err.code === "ENOENT") {
        // File does not exist; create with initial structure
        fileExists = false;
        content = `import { routeCreator } from "../utils";

export const urls = {
  health: {
    check: () => routeCreator("check"),
  },
};
`;
      } else {
        throw err; // Re-throw other errors
      }
    }

    if (!fileExists) {
      // Write the initial content to urls.ts
      await fs.writeFile(filePath, content, "utf8");
      console.log(`Created new URLs file: urls.ts`);
    }

    // Ensure the import statement exists
    if (!content.includes('import { routeCreator } from "../utils";')) {
      content = `import { routeCreator } from "../utils";\n\n` + content;
    }

    // Find the position of the last closing brace of the urls object
    const exportStart = content.indexOf("export const urls = {");
    if (exportStart === -1) {
      throw new Error("Cannot find 'export const urls = {' in urls.ts");
    }

    const closingBraceIndex = content.lastIndexOf("};");
    if (closingBraceIndex === -1) {
      throw new Error("Cannot find closing '};' in urls.ts");
    }

    // Check if the service routes already exist to prevent duplicates
    if (content.includes(`${serviceName}: {`)) {
      console.log(
        `Routes for service '${serviceName}' already exist in urls.ts`,
      );
      return;
    }

    // Insert the new service routes before the closing '};'
    const updatedContent =
      content.slice(0, closingBraceIndex) +
      newServiceRoutes +
      "\n" +
      content.slice(closingBraceIndex);

    // Write back the updated content to urls.ts
    await fs.writeFile(filePath, updatedContent, "utf8");
    console.log(`Appended routes for '${serviceName}' to urls.ts`);
  } catch (error) {
    console.error(`Error updating urls.ts:`, error);
  }
}

async function appendMiddlewareValidations(
  middlewaresPath: string,
  serviceName: string,
) {
  const verifyMiddlewarePath = path.join(
    middlewaresPath,
    "verifyMiddleware.ts",
  );

  // Read existing file content
  let content = await fs.readFile(verifyMiddlewarePath, "utf-8");

  // Check if the validations already exist to prevent duplicates
  const newValidationName = `add${serviceName}InputValidation`;
  if (content.includes(newValidationName)) {
    console.log(`Validations for ${serviceName} already exist. Skipping...`);
    return;
  }

  // Find the sections we need to modify
  const importSection =
    content.match(/import \{[\s\S]*?\} from "\.\.\/utils\/validate";/)?.[0] ||
    "";
  const lastConstDefinition = content.lastIndexOf("const validateVeiwAllInput");
  const verifyMiddlewareDefinition = content.indexOf(
    "const verifyMiddleware = {",
  );

  // Extract the imports we need to add
  const newImports = `add${serviceName}InputValidation,
  update${serviceName}InputValidation,`;

  // Insert new imports before the closing brace of the validate import
  const updatedImports = importSection.replace(
    '} from "../utils/validate";',
    `${newImports}\n} from "../utils/validate";`,
  );

  // Create new middleware definitions
  const newMiddlewareDefinitions = `\n\nconst validateCreate${capitalizedServiceName}Request = createValidationMiddleware(
  add${serviceName}InputValidation,
  "body"
);

const update${capitalizedServiceName}InputRequest = createValidationMiddleware(
  update${serviceName}InputValidation,
  "body"
);`;

  // Find and update the verifyMiddleware object
  const verifyMiddlewareContent = content.slice(
    verifyMiddlewareDefinition,
    content.indexOf("};", verifyMiddlewareDefinition) + 2,
  );

  const updatedVerifyMiddleware = verifyMiddlewareContent.replace(
    "};",
    `validateCreate${capitalizedServiceName}Request,
  update${capitalizedServiceName}InputRequest,
};`,
  );

  // Construct the final content
  const finalContent =
    content.slice(0, content.indexOf(importSection)) +
    updatedImports +
    content.slice(
      content.indexOf(importSection) + importSection.length,
      lastConstDefinition,
    ) +
    content.slice(lastConstDefinition, verifyMiddlewareDefinition) +
    newMiddlewareDefinitions +
    "\n" +
    updatedVerifyMiddleware +
    "\n\nexport { verifyMiddleware };";

  // Write the updated content back to the file
  await fs.writeFile(verifyMiddlewarePath, finalContent);
}

async function appendToFile(modelsPath: any, modelTypes: any) {
  try {
    // Ensure the directory exists
    await fs.mkdir(modelsPath, { recursive: true });

    const filePath = path.join(modelsPath, modelTypes.name);

    // Read the existing file content, if any
    let existingContent = "";
    try {
      existingContent = await fs.readFile(filePath, "utf8");
    } catch (err) {
      if (err.code !== "ENOENT") throw err; // Ignore file-not-found errors
    }

    // Check for existing imports and type definitions
    const importsToCheck = [
      `import { Helpers } from "../types";`,
      `import { Model } from "sequelize";`,
    ];

    const typeToCheck = `export type FindInfoParams = {`;

    // Filter out duplicate imports
    let newImports = importsToCheck
      .filter((imp) => !existingContent.includes(imp))
      .join("\n");

    // Add FindInfoParams only if it doesn't already exist
    let newTypeDefinition = "";
    if (!existingContent.includes(typeToCheck)) {
      newTypeDefinition = `
export type FindInfoParams = {
  orderBy?: string;
  sort?: "ASC" | "DESC";
  size?: number;
  page?: number;
  gSearch?: string;
  filter?: Record<string, any>;
  status?: string;
  option?: string;
  startDate?: string;
  endDate?: string;
};
`;
    }

    // Combine new imports, type definition, and model content
    const updatedContent = [
      existingContent.trim(),
      newImports,
      modelTypes.content.trim(),
      newTypeDefinition.trim(),
    ]
      .filter((section) => section.length > 0)
      .join("\n\n");

    // Write the updated content back to the file
    await fs.writeFile(filePath, updatedContent, "utf8");

    console.log("Content successfully appended!");
  } catch (err) {
    console.error("Error appending content:", err);
  }
}

async function createService() {
  try {
    // Ensure the necessary folders exist
    await fs.mkdir(controllersPath, { recursive: true });
    await fs.mkdir(modelsPath, { recursive: true });
    await fs.mkdir(urlsPath, { recursive: true });
    await fs.mkdir(routersPath, { recursive: true });
    await fs.mkdir(middlewaresPath, { recursive: true });

    // Write controller and model files
    await fs.writeFile(
      path.join(controllersPath, controllerFile.name),
      controllerFile.content,
    );
    console.log(`Created controller file: ${controllerFile.name}`);

    await fs.writeFile(
      path.join(modelsPath, modelFile.name),
      modelFile.content,
    );
    console.log(`Created model file: ${modelFile.name}`);

    // await fs.writeFile(
    //   path.join(modelsPath, modelTypes.name),
    //   modelTypes.content,
    // );
    await appendToFile(modelsPath, modelTypes);

    await appendRoutesToUrls(path.join(urlsPath), urlsFile.content.trim());
    console.log(`Created URL file: ${urlsFile.name}`);

    await fs.writeFile(
      path.join(routersPath, routersFile.name),
      routersFile.content,
    );
    console.log(`Created router file: ${routersFile.name}`);

    // Update controllers index.ts
    const controllerImport = `import * as ${serviceName}Controller from "./${serviceName}";`;
    await updateIndexFile(
      path.join(controllersPath, "index.ts"),
      controllerImport,
      serviceName,
    );

    // Update models index.ts
    const modelImport = `import * as ${serviceName}Model from "./${serviceName}";`;
    await updateModelIndexFile(
      path.join(modelsPath, "index.ts"),
      modelImport,
      serviceName,
    );

    await appendMiddlewareValidations(middlewaresPath, capitalizedServiceName);

    console.log(`Service module '${serviceName}' generated successfully!`);
  } catch (error) {
    console.error("Error creating service module:", error);
  }
}

// Run the service creation
createService();
