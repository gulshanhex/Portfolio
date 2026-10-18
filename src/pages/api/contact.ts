import type { APIRoute } from 'astro';
import { addSubmission, checkContactRateLimit, getSetting } from '../../lib/db';
import { badRequest, getClientIp, jsonResponse, serverError, tooManyRequests } from '../../lib/response';
import { initializeDatabaseSchemaAndSeed } from '../../lib/schema-sql';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime?.env?.DB;
    if (!db) {
      return serverError('Database binding (DB) is not configured.');
    }

    const contactCfg = (await getSetting(db, 'contact')) || {};
    if (contactCfg.form_enabled === false) {
      return jsonResponse({ error: 'Contact form is currently disabled.' }, 403);
    }

    const ip = getClientIp(request);
    const withinLimit = await checkContactRateLimit(db, ip);
    if (!withinLimit) {
      return tooManyRequests('Too many messages sent recently. Please wait 10 minutes before trying again.', 600);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid request body');
    }

    const { name, email, subject, message, _hp, _elapsed } = body as Record<string, unknown>;

    // Honeypot validation
    if (_hp && String(_hp).trim().length > 0) {
      return jsonResponse({ ok: true, message: "Message received! I'll get back to you soon." });
    }

    // Minimum fill-time validation using client-side elapsed time delta
    if (_elapsed !== undefined && _elapsed !== null && _elapsed !== '') {
      const elapsed = Number(_elapsed);
      if (!isNaN(elapsed) && elapsed < 2000) {
        return badRequest('Form submitted too quickly. Please take a moment and try again.');
      }
    }

    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
      return badRequest('Name is required (max 100 chars)');
    }
    if (
      !email ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      email.length > 200
    ) {
      return badRequest('Valid email address is required');
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 5000) {
      return badRequest('Message must be between 5 and 5000 characters');
    }

    try {
      await addSubmission(db, {
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 200),
        subject: subject ? String(subject).trim().slice(0, 200) : null,
        message: message.trim().slice(0, 5000),
        ip,
      });
    } catch {
      await initializeDatabaseSchemaAndSeed(db);
      await addSubmission(db, {
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 200),
        subject: subject ? String(subject).trim().slice(0, 200) : null,
        message: message.trim().slice(0, 5000),
        ip,
      });
    }

    return jsonResponse({ ok: true, message: "Message received! I'll get back to you soon." });
  } catch (err) {
    console.error('Contact submit error:', err);
    return serverError('Failed to save message. Please try again.');
  }
};
