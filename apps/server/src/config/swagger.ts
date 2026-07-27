import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Advanced Feedback System API",
      version: "1.0.0",
      description:
        "A secure, full-stack web application for restaurant feedback analysis using LLM.",
    },
    servers: [
      {
        url: process.env.PORT
          ? `https://${process.env.RENDER_EXTERNAL_URL || "localhost:3001"}`
          : "http://localhost:3001",
        description: "Current server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "admin@restaurant.com",
            },
            password: {
              type: "string",
              example: "admin123",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
            },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                email: { type: "string" },
                role: { type: "string" },
              },
            },
          },
        },
        FeedbackRequest: {
          type: "object",
          required: ["text"],
          properties: {
            text: {
              type: "string",
              example:
                "The pizza was great but the service was extremely slow.",
            },
          },
        },
        FeedbackResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            raw_text: { type: "string" },
            sentiment: {
              type: "string",
              enum: ["Positive", "Neutral", "Negative"],
            },
            key_items: {
              type: "array",
              items: { type: "string" },
            },
            requires_action: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
