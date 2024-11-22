export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BRIGHT_DATA_USERNAME: string;
      BRIGHT_DATA_PASSWORD: string;
      MONGODB_URI: string;
      EMAIL_PASSWORD: string;
    }
  }
}

export type NotificationType =
  | "WELCOME"
  | "CHANGE_OF_STOCK"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET";

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
};
