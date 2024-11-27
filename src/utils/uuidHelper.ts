import crypto from "crypto";

const uuidHelper = {
  /**
   * Generates a UUID v4
   * @returns {string} UUID v4 string
   */
  generate: (): string => {
    return crypto.randomUUID();
  },

  /**
   * Generates a UUID without dashes
   * @returns {string} UUID string without dashes
   */
  generateWithoutDashes: (): string => {
    return crypto.randomUUID().replace(/-/g, "");
  },

  /**
   * Generates a shorter UUID (first 8 characters)
   * @returns {string} Short UUID string
   */
  generateShort: (): string => {
    return crypto.randomUUID().split("-")[0];
  },

  /**
   * Validates if a string is a valid UUID
   * @param {string} uuid - String to validate
   * @returns {boolean} True if valid UUID
   */
  isValid: (uuid: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Adds dashes to a UUID string that has had them removed
   * @param {string} uuid - UUID string without dashes
   * @returns {string} UUID with dashes
   */
  addDashes: (uuid: string): string => {
    if (typeof uuid !== "string" || uuid.length !== 32) {
      throw new Error("Invalid UUID string");
    }
    return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(
      12,
      16,
    )}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
  },
};

export { uuidHelper };
