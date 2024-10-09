import {
  createLogger as createWinstonLogger,
  format,
  transports,
  addColors,
} from "winston";
import morgan, { FormatFn } from "morgan";
import { IncomingMessage } from "node:http";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

addColors(colors);

const createLogger = (importMetaUrl: string) =>
  createWinstonLogger({
    level: "http",
    levels,
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
    (req.method === "POST" && req.url?.includes("api/ping")) ||
    (req.method === "GET" && req.url?.endsWith(".svg")) ||
    (req.method === "GET" && req.url?.endsWith(".ts")) ||
    (req.method === "GET" && req.url?.endsWith(".tsx")) ||
    (req.method === "GET" && req.url?.endsWith(".css")) ||
    (req.method === "GET" && req.url?.endsWith(".js")) ||
    (req.method === "GET" && req.url?.endsWith(".mjs")) ||
    (req.method === "GET" && req.url?.endsWith(".svg")) ||
    (req.method === "GET" && req.url?.endsWith(".png")) ||
    (req.method === "GET" && req.url?.endsWith(".jpg")) ||
    (req.method === "GET" && req.url?.endsWith(".ico")) ||
    (req.method === "GET" && req.url?.endsWith(".woff")) ||
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

const textFormat: FormatFn = (tokens, req, res) =>
  `${tokens["remote-addr"](req, res)} [${tokens["staff"](req, res) || ""}] ${tokens["method"](req, res)} ${tokens["url"](req, res)} ${tokens["status"](req, res)} ${tokens["response-time"](req, res)} ms`;

const textStream = {
  // Use the http severity
  write: (message: string) => createLogger("HTTP").http(message),
};

const morganMiddleware = morgan(textFormat, { stream: textStream, skip });

export { createLogger, morganMiddleware };
