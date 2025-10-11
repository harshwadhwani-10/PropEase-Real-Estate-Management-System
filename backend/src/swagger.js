// backend/src/swagger.js
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

export const setSwagger = function (app) {
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "PropEase API Documentation",
      version: "0.1.0",
      description: "API docs for PropEase Real Estate Management System",
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}`, description: "Local server" },
    ],
  };

  const options = {
    swaggerDefinition,
    // scan your routes for JSDoc comments; adjust paths if you put controllers elsewhere
    apis: ["./src/routes/**/*.js", "./src/controllers/**/*.js"],
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
