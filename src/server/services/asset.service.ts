import * as unzipper from "unzipper";
import { writeClient } from "@/sanity/lib/client";
import { Readable } from "stream";

// Ensure we load the CommonJS version of file-type dynamically since it's an ESM package.
// For Next.js App Router, using dynamic import is safest.
let fileTypeFromBuffer: any;

export interface ExtractedImage {
  filename: string;
  buffer: Buffer;
  mime: string;
}

export class AssetService {
  /**
   * Extracts images from a ZIP buffer and validates their magic numbers.
   */
  static async extractImagesFromZip(zipBuffer: Buffer): Promise<ExtractedImage[]> {
    if (!fileTypeFromBuffer) {
      const ft = await import("file-type");
      fileTypeFromBuffer = ft.fileTypeFromBuffer;
    }

    const directory = await unzipper.Open.buffer(zipBuffer);
    const extractedImages: ExtractedImage[] = [];

    // Max 500 files to prevent ZIP bombs
    let fileCount = 0;
    const MAX_FILES = 500;
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    let totalSize = 0;

    for (const file of directory.files) {
      if (file.type === "Directory" || file.path.startsWith("__MACOSX") || file.path.includes(".DS_Store")) {
        continue;
      }

      fileCount++;
      if (fileCount > MAX_FILES) {
        throw new Error("ZIP file contains too many items. Max allowed is 500.");
      }

      const fileBuffer = await file.buffer();
      totalSize += fileBuffer.length;
      if (totalSize > MAX_SIZE) {
        throw new Error("ZIP file expands to too large a size. Max allowed is 50MB.");
      }

      const typeInfo = await fileTypeFromBuffer(fileBuffer);
      if (!typeInfo || !["image/jpeg", "image/png", "image/webp"].includes(typeInfo.mime)) {
        throw new Error(`Invalid file type detected in ZIP: ${file.path}. Only JPG, PNG, and WEBP are allowed.`);
      }

      // Normalize filename: lowercase, no spaces, just basename
      const basename = file.path.split("/").pop() || file.path;
      const normalizedFilename = basename.toLowerCase().trim();

      extractedImages.push({
        filename: normalizedFilename,
        buffer: fileBuffer,
        mime: typeInfo.mime,
      });
    }

    return extractedImages;
  }

  /**
   * Uploads a single image buffer to Sanity and returns the asset reference ID.
   * Sanity automatically handles deduplication based on content hash.
   */
  static async uploadImageToSanity(buffer: Buffer, filename: string): Promise<string> {
    const readable = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    const asset = await writeClient.assets.upload("image", readable, {
      filename,
      contentType: "image/jpeg", // fallback
    });

    return asset._id;
  }
}
