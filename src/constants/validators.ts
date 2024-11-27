/* eslint-disable max-len */
export const validators = {
  validateSignupInput: {
    messages: {
      failedToMatchPattern:
        "{{#label}} must have: 1 lowercase,1 uppercase,1 digit,and 1 special char (e.g., @$!%*?/,;_+#&).",
      failedToMatchBase:
        "{{#label}} with value {:[.]} fails to match  the required pattern: { { #regex } } ",
    },
    patterns: {
      password: new RegExp(
        [
          "^(?=.*[a-z])",
          "(?=.*[A-Z])",
          "(?=.*\\d)",
          "(?=.*[@$!%*?/,;_+#&])",
          "[A-Za-z\\d@$!%*?/,;_+#&]{8,}$",
        ].join(""),
      ),
      passwordMissMatch: "{{#label}} does not match password",
    },
  },
};
