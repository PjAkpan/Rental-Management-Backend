import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { getters } from "../../config";
import { AppUrls, EmailLocals, EmailOptions, User } from "../../types";
import sendMail from "../../utils/mailler";

// Constants
const { frontendUrl, backendUrl }: AppUrls = getters.getAppUrls();

// Read and compile email template
const source: string = fs.readFileSync(
  path.join("src/templates/email", "verifyOTPEmail.hbs"),
  "utf8"
);

const template: HandlebarsTemplateDelegate<EmailLocals> =
  Handlebars.compile(source);

const options = (email: string, locals: EmailLocals): EmailOptions => {
  return {
    from: "\"Ajora\" Support",
    to: email,
    subject: "Ajora | One-Time Password",
    html: template(locals),
  };
};

const sendVerifyOtp = async (user: User): Promise<void> => {
  const locals: EmailLocals = {
    logoUrl: `${backendUrl}defaults/logo.svg`,
    verifyOtp: user.otpNumber,
    contactUsLink: `${frontendUrl}/contact-us`,
  };

  await sendMail(options(user.email, locals));
};

export { sendVerifyOtp };
