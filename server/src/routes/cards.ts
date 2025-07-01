import { Elysia } from "elysia";
import { t } from "elysia";
import { CardSchema, CardEntity } from "$shared/types/card";
import path from "node:path";
import fs from "node:fs";
export const cardsRoutes = new Elysia({ prefix: "cards" }).get(
  "/:filename",
  ({ params, status, set }) => {
    // Возвращаем предопределенные карты для MVP
    const { filename } = params;
    console.log(filename);
    const validExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(filename).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return status(400, "Invalid file type");
    }
    const filePath = path.join(
      process.cwd(),
      "assets",
      "cards",
      params.filename,
    );
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return status(404, "Image not found");
      }

      // Read file
      const file = Bun.file(filePath);

      // Set appropriate content type
      const mimeTypes: { [key: string]: string } = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
      };

      set.headers["Content-Type"] =
        mimeTypes[fileExtension] || "application/octet-stream";
      set.headers["Cache-Control"] = "public, max-age=3600"; // Cache for 1 hour

      return file;
    } catch (error) {
      console.error("Error serving image:", error);
      return status(500, "Internal server error");
    }
  },
  {
    params: t.Object({
      filename: t.String(),
    }),
    response: {
      200: t.File(),
      400: t.String(),
      404: t.String(),
      500: t.String(),
    },
  },
);
