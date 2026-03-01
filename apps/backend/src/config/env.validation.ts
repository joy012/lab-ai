export interface EnvConfig {
  PORT: number;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  GEMINI_API_KEY: string;
  GROQ_API_KEY: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  MAIL_FROM: string;
  APP_URL: string;
  CLIENT_URL: string;
  WEB_URL: string;
}
