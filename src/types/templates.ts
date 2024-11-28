export type AppUrls = {
  frontendUrl: string;
  backendUrl: string;
};

export type AppMailers = {
  fromAddress: string;
};

export type EmailLocals = {
  logoUrl: string;
  verifyOtp: string | number;
  contactUsLink: string;
};

export type EmailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export type VerifyUser = {
  email: string;
  otpNumber: string | number;
};

// export types
export type MailerConfig = {
  server: string;
  username: string;
  password: string;
};

export type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
  [key: string]: unknown; // For any additional mail options
};

export type TransportConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    rejectUnauthorized: boolean;
  };
};
