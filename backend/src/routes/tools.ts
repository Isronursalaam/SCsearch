import { Router, Request, Response } from 'express';
import { getToolsByCategory, searchTools, type OsintTool } from '../data/toolRegistry.js';

const router = Router();

/**
 * GET /api/tools
 * Returns OSINT tools, optionally filtered by category or search query.
 * 
 * Query params:
 *   - category: 'image-recon' | 'domain-ip' | 'email-username' | 'all'
 *   - q: search query string
 */
router.get('/tools', (req: Request, res: Response): void => {
  const { category, q } = req.query;

  let results: OsintTool[];

  if (q && typeof q === 'string') {
    results = searchTools(q);
    // Further filter by category if both are provided
    if (category && typeof category === 'string' && category !== 'all') {
      results = results.filter((t) => t.category === category);
    }
  } else {
    results = getToolsByCategory(category as string | undefined);
  }

  res.json({
    success: true,
    count: results.length,
    tools: results,
  });
});

export default router;
