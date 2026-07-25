import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { extractMetadata } from '../services/exifService.js';
import { reverseImageSearch } from '../services/imageSearchService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

const router = Router();

/**
 * POST /api/upload
 * Upload an image file for EXIF extraction + reverse image search.
 */
router.post('/upload', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    // Handle file upload
    if (req.file) {
      const { originalname, mimetype, path: filePath } = req.file;
      
      // Read the file buffer for EXIF parsing
      const fileBuffer = fs.readFileSync(filePath);
      
      // Extract metadata
      const metadata = await extractMetadata(fileBuffer, originalname, mimetype);

      // Build a public URL for the uploaded image
      const fileName = path.basename(filePath);
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

      // Perform reverse image search
      const searchResults = await reverseImageSearch(imageUrl);

      res.json({
        success: true,
        mode: 'upload',
        imageUrl,
        metadata,
        searchResults,
      });
      return;
    }

    // Handle URL-based search
    const { url } = req.body;
    if (url && typeof url === 'string') {
      // Attempt to fetch the image from the URL for metadata extraction
      let metadata = null;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = response.headers.get('content-type') || 'image/unknown';
          const urlParts = new URL(url);
          const fileName = path.basename(urlParts.pathname) || 'remote-image';
          metadata = await extractMetadata(buffer, fileName, contentType);
        }
      } catch {
        // Could not fetch remote image — proceed without metadata
      }

      // Perform reverse image search
      const searchResults = await reverseImageSearch(url);

      res.json({
        success: true,
        mode: 'url',
        imageUrl: url,
        metadata,
        searchResults,
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: 'No image file or URL provided. Send a file as "image" field or a JSON body with "url" field.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
