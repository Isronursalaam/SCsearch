import { Router, Request, Response } from 'express';
import { searchUsername } from '../services/usernameService.js';
import { domainLookup } from '../services/domainService.js';
import { emailLookup } from '../services/emailService.js';
import { lookupPhone, enumerateSubdomains, analyzeHashOrText, lookupHashToString } from '../services/extraToolsService.js';
import { lookupMac, auditHttpHeaders, processEncoding } from '../services/moreToolsService.js';
import { analyzeThreatReputation } from '../services/reputationService.js';
import { calculateSunPosition } from '../services/sunService.js';

const router = Router();

/**
 * POST /api/username-search
 * Search for a username across social platforms.
 */
router.post('/username-search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid username (minimum 2 characters).',
      });
      return;
    }

    const sanitized = username.trim().replace(/[^a-zA-Z0-9._-]/g, '');

    if (!sanitized) {
      res.status(400).json({
        success: false,
        error: 'Username contains invalid characters. Use only letters, numbers, dots, underscores, and hyphens.',
      });
      return;
    }

    const results = await searchUsername(sanitized);

    const found = results.filter(r => r.status === 'found').length;
    const notFound = results.filter(r => r.status === 'not_found').length;
    const errors = results.filter(r => r.status === 'error').length;

    res.json({
      success: true,
      username: sanitized,
      summary: { total: results.length, found, notFound, errors },
      results,
    });
  } catch (error) {
    console.error('Username search error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/domain-lookup
 * Perform WHOIS, DNS, and GeoIP lookup for a domain or IP.
 */
router.post('/domain-lookup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain } = req.body;

    if (!domain || typeof domain !== 'string' || domain.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid domain name or IP address.',
      });
      return;
    }

    const result = await domainLookup(domain.trim());

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Domain lookup error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/email-lookup
 * Perform email intelligence lookup.
 */
router.post('/email-lookup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
      return;
    }

    const result = await emailLookup(email.trim());

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Email lookup error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/phone-lookup
 */
router.post('/phone-lookup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string') {
      res.status(400).json({ success: false, error: 'Please provide a valid phone number.' });
      return;
    }
    const result = await lookupPhone(phone);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/subdomain-scan
 */
router.post('/subdomain-scan', async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string') {
      res.status(400).json({ success: false, error: 'Please provide a valid domain.' });
      return;
    }
    const result = await enumerateSubdomains(domain);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/hash-analyze
 */
router.post('/hash-analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== 'string') {
      res.status(400).json({ success: false, error: 'Please provide a string or hash to analyze.' });
      return;
    }
    const result = analyzeHashOrText(input);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/mac-lookup
 */
router.post('/mac-lookup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mac } = req.body;
    if (!mac || typeof mac !== 'string') {
      res.status(400).json({ success: false, error: 'Please provide a valid MAC address.' });
      return;
    }
    const result = await lookupMac(mac);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/header-audit
 */
router.post('/header-audit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'Please provide a valid URL.' });
      return;
    }
    const result = await auditHttpHeaders(url);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/encode-decode
 */
router.post('/encode-decode', async (req: Request, res: Response): Promise<void> => {
  try {
    const { input, mode } = req.body;
    if (!input || typeof input !== 'string') {
      res.status(400).json({ success: false, error: 'Please provide input string.' });
      return;
    }
    const result = processEncoding(input, mode === 'decode' ? 'decode' : 'encode');
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/threat-reputation
 */
router.post('/threat-reputation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== 'string' || input.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Please provide a valid domain, IP, URL, or hash.' });
      return;
    }
    const result = await analyzeThreatReputation(input);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

/**
 * POST /api/sun-calc (GEOINT Sun & Shadow Calculator)
 */
router.post('/sun-calc', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lon, date, objectHeight } = req.body;
    if (lat == null || lon == null) {
      res.status(400).json({ success: false, error: 'Please provide latitude and longitude.' });
      return;
    }
    const dateStr = date || new Date().toISOString();
    const height = objectHeight ? Number(objectHeight) : 1.0;
    const result = calculateSunPosition(Number(lat), Number(lon), dateStr, height);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
