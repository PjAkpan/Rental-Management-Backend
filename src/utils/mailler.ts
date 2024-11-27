import nodemailer, { Transporter, SentMessageInfo } from "nodemailer";
import { getters } from "../config";
import { logger } from "netwrap";
import { MailOptions, TransportConfig } from "@types";
import { returnObject } from "../utils";

// Get mailer configuration

// Create transport configuration
const transportConfig: TransportConfig = {
  host: getters.getAppMailers().server,
  port: 465,
  secure: true,
  auth: {
    user: getters.getAppMailers().username,
    pass: getters.getAppMailers().password,
  },
  tls: {
    rejectUnauthorized: false, // Set to true in production
  },
};

// logger(transportConfig);

// Create transporter
const transporter: Transporter = nodemailer.createTransport(transportConfig);

// Verify transporter
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    logger("Server is currently unable to accept mail processing requests", {
      isError: true,
    });
    logger(error);
  } else {
    logger("Server is ready to accept mail processing");
  }
  logger(success);
});

// Get default recipients
const defaultRecipients: string[] = getters
  .getDefaultMails()
  .all.split(",")
  .map((email: string) => email.trim());

// Main mail sending function
const sendMail = async (mailOptions: MailOptions): Promise<void> => {
  try {
    // Send to primary recipient
    const info: SentMessageInfo = await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });

    // Log success for primary recipient
    returnObject(true, "Successfully sent email", info);

    // Send to default recipients
    await Promise.all(
      defaultRecipients.map(async (recipient: string) => {
        const recipientMailOptions: MailOptions = {
          ...mailOptions,
          to: recipient,
        };

        try {
          const info: SentMessageInfo = await new Promise((resolve, reject) => {
            transporter.sendMail(recipientMailOptions, (err, info) => {
              if (err) {
                reject(err);
              } else {
                resolve(info);
              }
            });
          });

          logger(`Email successfully sent to ${recipient}: ${info.response}`);
        } catch (error) {
          logger(
            `Error sending email to ${recipient}: ${(error as Error).message}`,
            {
              isError: true,
            }
          );
        }
      })
    );
  } catch (error) {
    logger(`Error sending email : ${(error as Error).message}`, {
      isError: true,
    });
    returnObject(false, "Error occurred while sending email", error);
  }
};

export default sendMail;
