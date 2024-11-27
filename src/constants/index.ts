import { i18n } from "./i18n";
import { urls } from "./urls";
import { validators } from "./validators";

export const constants = {
  defaults: {
    currentLanguage: "en",
    environment: "development",
    appPort: 7000,
  },
  i18n,
  urls,
  validators,
};
