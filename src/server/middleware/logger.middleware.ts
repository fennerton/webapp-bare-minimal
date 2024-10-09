import {
  createLogger as createWinstonLogger,
  format,
  transports,
} from "winston";
import morgan from "morgan";
import { IncomingMessage } from "node:http";

const createLogger = (importMetaUrl: string) =>
  createWinstonLogger({
    level: "http",
    format: format.combine(
      process.env.NODE_ENV !== "production"
        ? format.colorize({ all: true })
        : format.uncolorize(),
      format.timestamp({
        format: "YYYY-MM-DD hh:mm:ss.SSS A",
      }),
      format.printf((info) =>
        process.env.NODE_ENV !== "production"
          ? `[${info.timestamp}] [${importMetaUrl}] ${info.level}: ${info.message}`
          : `[${info.timestamp}] ${info.level}: ${info.message}`,
      ),
    ),
    transports: [new transports.Console()],
  });

const skip = (req: IncomingMessage) => {
  return (
    (req.method === "GET" && req.url === "/ping") ||
    (req.method === "GET" && req.url === "/") || //health check
    req.method === "OPTION" ||
    req.method === "OPTIONS"
  );
};

morgan.token("staff", (req: any) => {
  return req.user ? req.user.staffId : null;
});

morgan.token("body", (req: any) => {
  if (req.url === "/login") {
    return undefined;
  }
  let body = undefined;
  if (
    req &&
    req.body &&
    (typeof req.body === "string" || Object.keys(req.body).length)
  ) {
    body = JSON.stringify(req.body);
  }
  return body;
});

const textFormat = () =>
  ":remote-addr [:staff] :method :url :status :response-time ms";

const textStream = {
  // Use the http severity
  write: (message: string) => createLogger("HTTP").http(message),
};

const morganMiddleware = morgan(textFormat, { stream: textStream, skip });

export { createLogger, morganMiddleware };
