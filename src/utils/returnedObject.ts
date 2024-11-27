/**
 * Function description here.
 *
 * @param {boolean} status The status of something.
 * @param {string} message The message to be returned.
 * @param {unknow} data Additional data to be returned.
 * @returns {{ status: boolean; message: string;
 * data: unknow }} An object containing the status, message, and data.
 */
const returnObject = (status: boolean, message: string, data: unknown) => ({
  status,
  message,
  data,
});

export { returnObject };
