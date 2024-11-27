import { Helpers } from "src/types/types";

export const successHandler: Helpers.SuccessHandlerFn = (
  data: unknown,
  successMessage,
) => {
  return {
    status: true,
    message: `Successfully ${successMessage}`,
    payload: data,
  };
};
