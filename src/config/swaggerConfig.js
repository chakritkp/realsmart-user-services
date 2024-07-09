
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOption = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "A simple API documentation",
    },
    servers: [
      {
        url: `http://localhost:3000`,
      },
    ],
  },
  apis: ["../routers/router.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOption);

export default swaggerSpec;
