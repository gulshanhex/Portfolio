import type { APIRoute } from 'astro';
import {
  buildOtpAuthUri,
  generateTotpSecret,
  hashPassword,
  revokeOtherSessions,
  verifyCsrfToken,
  verifyPassword,
  verifyTotpCode,
} from '../../../lib/auth';
import {
  getAllSettings,
  getDashboardStats,
  getEducation,
  getExperiences,
  getFaqs,
  getProjects,
  getProofItems,
  getSections,
  getServices,
  getSkills,
  getSubmissions,
  logAction,
  markSubmissionRead,
  sanitizeUrl,
  setSetting,
  safeJSON,
} from '../../../lib/db';
import { getEnvSecret } from '../../../lib/env';
import { badRequest, forbidden, jsonResponse, notFound, serverError, unauthorized } from '../../../lib/response';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const ALL: APIRoute = async ({ request, locals }) => {
  const session = locals.adminSession;
  if (!session) {
    return unauthorized('Unauthorized');
  }

  const env = locals.runtime?.env;
  const DB = env?.DB;
  if (!DB) {
    return serverError('D1 database binding (DB) not configured.');
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/admin/, '').replace(/\/$/, '') || '/';
  const method = request.method.toUpperCase();

  // Enforce Per-Session Cryptographic CSRF Token on all mutating requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfHeader = request.headers.get('X-CSRF-Token');
    const sessionSecret = getEnvSecret(env, 'SESSION_SECRET');
    const csrfOk = await verifyCsrfToken(csrfHeader, session.session_id, sessionSecret);
    if (!csrfOk) {
      return forbidden('CSRF token validation failed. Please refresh the page and try again.');
    }
  }

  try {
    // ── Dashboard ─────────────────────────────────────────────────────
    if (path === '/dashboard' && method === 'GET') {
      const [stats, settings] = await Promise.all([getDashboardStats(DB), getAllSettings(DB)]);
      return jsonResponse({ stats, settings });
    }

    // ── Settings ──────────────────────────────────────────────────────
    if (path === '/settings' && method === 'GET') {
      const settings = await getAllSettings(DB);
      return jsonResponse({ settings });
    }
    if (path === '/settings' && method === 'POST') {
      const body = (await request.json()) as Record<string, any>;
      const allowed = ['global', 'hero', 'about', 'contact', 'seo', 'theme', 'nav', 'proof_section', 'copy'];
      const savedKeys: string[] = [];

      // Handle both formats: { key: 'copy', value: ... } and { copy: { ... } }
      if (body.key && body.value !== undefined) {
        const k = String(body.key);
        if (allowed.includes(k)) {
          let v = body.value;
          if (typeof v === 'string') {
            try {
              v = JSON.parse(v);
            } catch {}
          }
          await setSetting(DB, k, v);
          savedKeys.push(k);
        }
      } else {
        for (const key of Object.keys(body)) {
          if (!allowed.includes(key)) continue;
          const valObj = body[key];
          if (valObj && typeof valObj === 'object') {
            if (key === 'global') {
              if (valObj.domain) valObj.domain = sanitizeUrl(valObj.domain) || '';
              if (valObj.portfolio) valObj.portfolio = sanitizeUrl(valObj.portfolio) || '';
              if (valObj.projects_subdomain) valObj.projects_subdomain = sanitizeUrl(valObj.projects_subdomain) || '';
            }
            if (key === 'contact') {
              if (valObj.linkedin) valObj.linkedin = sanitizeUrl(valObj.linkedin) || '';
              if (valObj.github) valObj.github = sanitizeUrl(valObj.github) || '';
              if (valObj.resume_url) valObj.resume_url = sanitizeUrl(valObj.resume_url) || '';
            }
            if (key === 'hero') {
              if (valObj.cta_primary_url) valObj.cta_primary_url = sanitizeUrl(valObj.cta_primary_url) || '#projects';
              if (valObj.cta_secondary_url) valObj.cta_secondary_url = sanitizeUrl(valObj.cta_secondary_url) || '#contact';
            }
            if (key === 'seo') {
              if (valObj.canonical) valObj.canonical = sanitizeUrl(valObj.canonical) || '';
              if (valObj.og_image) valObj.og_image = sanitizeUrl(valObj.og_image) || '';
            }
          }
          await setSetting(DB, key, valObj);
          savedKeys.push(key);
        }
      }

      if (savedKeys.length === 0) {
        return badRequest('No valid settings keys were provided or saved.');
      }

      await logAction(DB, 'settings_updated', { keys: savedKeys });
      return jsonResponse({ ok: true, saved: savedKeys });
    }

    // ── Sections ──────────────────────────────────────────────────────
    if (path === '/sections' && method === 'GET') {
      const sections = await getSections(DB);
      return jsonResponse({ sections });
    }
    if (path === '/sections' && method === 'PUT') {
      const { sections } = (await request.json()) as { sections: any[] };
      if (!Array.isArray(sections)) return badRequest('sections must be an array');
      const stmt = DB.prepare('INSERT OR REPLACE INTO sections (id, label, order_idx, visible) VALUES (?, ?, ?, ?)');
      await DB.batch(
        sections.map((s) => stmt.bind(String(s.id).slice(0, 40), String(s.label || s.id).slice(0, 80), Number(s.order_idx) || 0, s.visible ? 1 : 0))
      );
      return jsonResponse({ ok: true });
    }

    // ── Skills ────────────────────────────────────────────────────────
    if (path === '/skills' && method === 'GET') {
      const skills = await getSkills(DB);
      return jsonResponse({ skills });
    }
    if (path === '/skills' && method === 'POST') {
      const b = (await request.json()) as any;
      if (!b.label) return badRequest('label required');
      const result = await DB.prepare('INSERT INTO skills (label, icon, order_idx, visible) VALUES (?, ?, ?, ?)')
        .bind(String(b.label).slice(0, 100), String(b.icon || 'code').slice(0, 50), Number(b.order_idx) || 0, b.visible !== false ? 1 : 0)
        .run();
      const skillId = result.meta.last_row_id;
      if (Array.isArray(b.pills) && b.pills.length) {
        await DB.batch(
          b.pills.map((p: any, i: number) =>
            DB.prepare('INSERT INTO skill_pills (skill_id, label, is_hot, order_idx) VALUES (?, ?, ?, ?)').bind(
              skillId,
              String(p.label).slice(0, 80),
              p.is_hot ? 1 : 0,
              p.order_idx ?? i
            )
          )
        );
      }
      return jsonResponse({ ok: true, id: skillId });
    }
    const skMatch = path.match(/^\/skills\/(\d+)$/);
    if (skMatch && method === 'PUT') {
      const id = parseInt(skMatch[1]);
      const b = (await request.json()) as any;
      await DB.prepare('UPDATE skills SET label=?, icon=?, order_idx=?, visible=? WHERE id=?')
        .bind(String(b.label).slice(0, 100), String(b.icon || 'code').slice(0, 50), Number(b.order_idx) || 0, b.visible !== false ? 1 : 0, id)
        .run();
      await DB.prepare('DELETE FROM skill_pills WHERE skill_id=?').bind(id).run();
      if (Array.isArray(b.pills) && b.pills.length) {
        await DB.batch(
          b.pills.map((p: any, i: number) =>
            DB.prepare('INSERT INTO skill_pills (skill_id, label, is_hot, order_idx) VALUES (?, ?, ?, ?)').bind(
              id,
              String(p.label).slice(0, 80),
              p.is_hot ? 1 : 0,
              p.order_idx ?? i
            )
          )
        );
      }
      return jsonResponse({ ok: true });
    }
    if (skMatch && method === 'DELETE') {
      const id = parseInt(skMatch[1]);
      await DB.prepare('DELETE FROM skill_pills WHERE skill_id=?').bind(id).run();
      await DB.prepare('DELETE FROM skills WHERE id=?').bind(id).run();
      return jsonResponse({ ok: true });
    }

    // ── Services ──────────────────────────────────────────────────────
    if (path === '/services' && method === 'GET') {
      const services = await getServices(DB);
      return jsonResponse({ services });
    }
    if (path === '/services' && method === 'POST') {
      const b = (await request.json()) as any;
      if (!b.title) return badRequest('title required');

      const slug = (b.slug ? slugify(String(b.slug)) : slugify(String(b.title))) || null;
      if (slug) {
        const existing = await DB.prepare('SELECT id FROM services WHERE slug = ?').bind(slug).first();
        if (existing) {
          return new Response(JSON.stringify({ error: `Service slug "${slug}" is already in use.` }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      let featuresArr: string[] = [];
      if (Array.isArray(b.features)) {
        featuresArr = b.features.map((x: any) => String(x).trim()).filter(Boolean);
      } else if (typeof b.features === 'string') {
        try {
          const parsed = JSON.parse(b.features);
          if (Array.isArray(parsed)) featuresArr = parsed.map((x: any) => String(x).trim()).filter(Boolean);
          else featuresArr = b.features.split('\n').map((x: any) => String(x).trim()).filter(Boolean);
        } catch {
          featuresArr = b.features.split('\n').map((x: any) => String(x).trim()).filter(Boolean);
        }
      }

      await DB.prepare(
        'INSERT INTO services (icon, title, slug, description, long_description, features, cta_label, cta_url, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          String(b.icon || 'build').slice(0, 50),
          String(b.title).slice(0, 120),
          slug,
          String(b.description || '').slice(0, 1000),
          b.long_description ? String(b.long_description).slice(0, 5000) : '',
          JSON.stringify(featuresArr),
          b.cta_label ? String(b.cta_label).slice(0, 80) : null,
          sanitizeUrl(b.cta_url),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0
        )
        .run();
      return jsonResponse({ ok: true, slug });
    }
    const svcMatch = path.match(/^\/services\/(\d+)$/);
    if (svcMatch && method === 'PUT') {
      const id = parseInt(svcMatch[1]);
      const b = (await request.json()) as any;
      if (!b.title) return badRequest('title required');

      const slug = (b.slug ? slugify(String(b.slug)) : slugify(String(b.title))) || null;
      if (slug) {
        const existing = await DB.prepare('SELECT id FROM services WHERE slug = ? AND id != ?').bind(slug, id).first();
        if (existing) {
          return new Response(JSON.stringify({ error: `Service slug "${slug}" is already in use.` }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      let featuresArr: string[] = [];
      if (Array.isArray(b.features)) {
        featuresArr = b.features.map((x: any) => String(x).trim()).filter(Boolean);
      } else if (typeof b.features === 'string') {
        try {
          const parsed = JSON.parse(b.features);
          if (Array.isArray(parsed)) featuresArr = parsed.map((x: any) => String(x).trim()).filter(Boolean);
          else featuresArr = b.features.split('\n').map((x: any) => String(x).trim()).filter(Boolean);
        } catch {
          featuresArr = b.features.split('\n').map((x: any) => String(x).trim()).filter(Boolean);
        }
      }

      await DB.prepare(
        'UPDATE services SET icon=?, title=?, slug=?, description=?, long_description=?, features=?, cta_label=?, cta_url=?, order_idx=?, visible=? WHERE id=?'
      )
        .bind(
          String(b.icon || 'build').slice(0, 50),
          String(b.title).slice(0, 120),
          slug,
          String(b.description || '').slice(0, 1000),
          b.long_description ? String(b.long_description).slice(0, 5000) : '',
          JSON.stringify(featuresArr),
          b.cta_label ? String(b.cta_label).slice(0, 80) : null,
          sanitizeUrl(b.cta_url),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0,
          id
        )
        .run();
      return jsonResponse({ ok: true, slug });
    }
    if (svcMatch && method === 'DELETE') {
      await DB.prepare('DELETE FROM services WHERE id=?').bind(parseInt(svcMatch[1])).run();
      return jsonResponse({ ok: true });
    }

    // ── Experiences ───────────────────────────────────────────────────
    if (path === '/experiences' && method === 'GET') {
      const experiences = await getExperiences(DB);
      return jsonResponse({ experiences });
    }
    if (path === '/experiences' && method === 'POST') {
      const b = (await request.json()) as any;
      if (!b.title || !b.company) return badRequest('title and company required');
      await DB.prepare(
        'INSERT INTO experiences (badge_label, badge_type, icon, title, company, date_range, duration, location, bullet_points, tags, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          String(b.badge_label || '').slice(0, 60),
          b.badge_type === 'ember' ? 'ember' : 'lime',
          String(b.icon || 'work').slice(0, 50),
          String(b.title).slice(0, 150),
          String(b.company).slice(0, 150),
          String(b.date_range || '').slice(0, 80),
          String(b.duration || '').slice(0, 60),
          String(b.location || '').slice(0, 150),
          JSON.stringify(Array.isArray(b.bullet_points) ? b.bullet_points : []),
          JSON.stringify(Array.isArray(b.tags) ? b.tags : []),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0
        )
        .run();
      return jsonResponse({ ok: true });
    }
    const xpMatch = path.match(/^\/experiences\/(\d+)$/);
    if (xpMatch && method === 'PUT') {
      const id = parseInt(xpMatch[1]);
      const b = (await request.json()) as any;
      await DB.prepare(
        'UPDATE experiences SET badge_label=?, badge_type=?, icon=?, title=?, company=?, date_range=?, duration=?, location=?, bullet_points=?, tags=?, order_idx=?, visible=? WHERE id=?'
      )
        .bind(
          String(b.badge_label || '').slice(0, 60),
          b.badge_type === 'ember' ? 'ember' : 'lime',
          String(b.icon || 'work').slice(0, 50),
          String(b.title).slice(0, 150),
          String(b.company).slice(0, 150),
          String(b.date_range || '').slice(0, 80),
          String(b.duration || '').slice(0, 60),
          String(b.location || '').slice(0, 150),
          JSON.stringify(Array.isArray(b.bullet_points) ? b.bullet_points : []),
          JSON.stringify(Array.isArray(b.tags) ? b.tags : []),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0,
          id
        )
        .run();
      return jsonResponse({ ok: true });
    }
    if (xpMatch && method === 'DELETE') {
      await DB.prepare('DELETE FROM experiences WHERE id=?').bind(parseInt(xpMatch[1])).run();
      return jsonResponse({ ok: true });
    }

    // ── Education ─────────────────────────────────────────────────────
    if (path === '/education' && method === 'GET') {
      const education = await getEducation(DB);
      return jsonResponse({ education });
    }
    if (path === '/education' && method === 'POST') {
      const b = (await request.json()) as any;
      if (!b.degree) return badRequest('degree required');
      await DB.prepare(
        'INSERT INTO education (period, degree, stream, school, grade, items, pills, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          String(b.period || '').slice(0, 80),
          String(b.degree).slice(0, 150),
          String(b.stream || '').slice(0, 150),
          String(b.school || '').slice(0, 150),
          String(b.grade || 'In Progress').slice(0, 60),
          JSON.stringify(Array.isArray(b.items) ? b.items : []),
          JSON.stringify(Array.isArray(b.pills) ? b.pills : []),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0
        )
        .run();
      return jsonResponse({ ok: true });
    }
    const eduMatch = path.match(/^\/education\/(\d+)$/);
    if (eduMatch && method === 'PUT') {
      const id = parseInt(eduMatch[1]);
      const b = (await request.json()) as any;
      await DB.prepare(
        'UPDATE education SET period=?, degree=?, stream=?, school=?, grade=?, items=?, pills=?, order_idx=?, visible=? WHERE id=?'
      )
        .bind(
          String(b.period || '').slice(0, 80),
          String(b.degree).slice(0, 150),
          String(b.stream || '').slice(0, 150),
          String(b.school || '').slice(0, 150),
          String(b.grade || 'In Progress').slice(0, 60),
          JSON.stringify(Array.isArray(b.items) ? b.items : []),
          JSON.stringify(Array.isArray(b.pills) ? b.pills : []),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0,
          id
        )
        .run();
      return jsonResponse({ ok: true });
    }
    if (eduMatch && method === 'DELETE') {
      await DB.prepare('DELETE FROM education WHERE id=?').bind(parseInt(eduMatch[1])).run();
      return jsonResponse({ ok: true });
    }

    // ── Projects ──────────────────────────────────────────────────────
    if (path === '/projects' && method === 'GET') {
      const projects = await getProjects(DB);
      return jsonResponse({ projects });
    }
    if (path === '/projects' && method === 'POST') {
      const b = (await request.json()) as any;
      if (!b.title) return badRequest('title required');

      const slug = (b.slug ? slugify(String(b.slug)) : slugify(String(b.title))) || null;
      if (slug) {
        const existing = await DB.prepare('SELECT id FROM projects WHERE slug = ?').bind(slug).first();
        if (existing) {
          return new Response(JSON.stringify({ error: `Project slug "${slug}" is already in use.` }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      await DB.prepare(
        'INSERT INTO projects (title, slug, problem, solution, result, category, category_icon, summary, tags, stack, status, featured, external_url, github_url, demo_url, image_url, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          String(b.title).slice(0, 150),
          slug,
          b.problem ? String(b.problem).slice(0, 3000) : '',
          b.solution ? String(b.solution).slice(0, 3000) : '',
          b.result ? String(b.result).slice(0, 3000) : '',
          String(b.category || '').slice(0, 80),
          String(b.category_icon || 'folder').slice(0, 50),
          String(b.summary || '').slice(0, 1500),
          JSON.stringify(Array.isArray(b.tags) ? b.tags : []),
          JSON.stringify(Array.isArray(b.stack) ? b.stack : []),
          String(b.status || 'completed').slice(0, 40),
          b.featured ? 1 : 0,
          sanitizeUrl(b.external_url),
          sanitizeUrl(b.github_url),
          sanitizeUrl(b.demo_url),
          sanitizeUrl(b.image_url),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0
        )
        .run();
      return jsonResponse({ ok: true, slug });
    }
    const prMatch = path.match(/^\/projects\/(\d+)$/);
    if (prMatch && method === 'PUT') {
      const id = parseInt(prMatch[1]);
      const b = (await request.json()) as any;
      if (!b.title) return badRequest('title required');

      const slug = (b.slug ? slugify(String(b.slug)) : slugify(String(b.title))) || null;
      if (slug) {
        const existing = await DB.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').bind(slug, id).first();
        if (existing) {
          return new Response(JSON.stringify({ error: `Project slug "${slug}" is already in use.` }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      await DB.prepare(
        'UPDATE projects SET title=?, slug=?, problem=?, solution=?, result=?, category=?, category_icon=?, summary=?, tags=?, stack=?, status=?, featured=?, external_url=?, github_url=?, demo_url=?, image_url=?, order_idx=?, visible=? WHERE id=?'
      )
        .bind(
          String(b.title).slice(0, 150),
          slug,
          b.problem ? String(b.problem).slice(0, 3000) : '',
          b.solution ? String(b.solution).slice(0, 3000) : '',
          b.result ? String(b.result).slice(0, 3000) : '',
          String(b.category || '').slice(0, 80),
          String(b.category_icon || 'folder').slice(0, 50),
          String(b.summary || '').slice(0, 1500),
          JSON.stringify(Array.isArray(b.tags) ? b.tags : []),
          JSON.stringify(Array.isArray(b.stack) ? b.stack : []),
          String(b.status || 'completed').slice(0, 40),
          b.featured ? 1 : 0,
          sanitizeUrl(b.external_url),
          sanitizeUrl(b.github_url),
          sanitizeUrl(b.demo_url),
          sanitizeUrl(b.image_url),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0,
          id
        )
        .run();
      return jsonResponse({ ok: true, slug });
    }
    if (prMatch && method === 'DELETE') {
      await DB.prepare('DELETE FROM projects WHERE id=?').bind(parseInt(prMatch[1])).run();
      return jsonResponse({ ok: true });
    }

    // ── Proof Items ───────────────────────────────────────────────────
    if (path === '/proof' && method === 'GET') {
      const items = await getProofItems(DB);
      const settings = await getAllSettings(DB);
      return jsonResponse({ items, settings });
    }
    if (path === '/proof' && method === 'POST') {
      const b = (await request.json()) as any;
      if (!b.name) return badRequest('name required');
      await DB.prepare(
        'INSERT INTO proof_items (type, name, subtitle, logo_url, url, testimonial_text, testimonial_rating, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          b.type === 'testimonial' ? 'testimonial' : 'org',
          String(b.name).slice(0, 150),
          String(b.subtitle || '').slice(0, 150),
          sanitizeUrl(b.logo_url),
          sanitizeUrl(b.url),
          b.testimonial_text ? String(b.testimonial_text).slice(0, 1500) : null,
          Math.min(Math.max(Number(b.testimonial_rating) || 5, 1), 5),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0
        )
        .run();
      return jsonResponse({ ok: true });
    }
    const pfMatch = path.match(/^\/proof\/(\d+)$/);
    if (pfMatch && method === 'PUT') {
      const id = parseInt(pfMatch[1]);
      const b = (await request.json()) as any;
      await DB.prepare(
        'UPDATE proof_items SET type=?, name=?, subtitle=?, logo_url=?, url=?, testimonial_text=?, testimonial_rating=?, order_idx=?, visible=? WHERE id=?'
      )
        .bind(
          b.type === 'testimonial' ? 'testimonial' : 'org',
          String(b.name).slice(0, 150),
          String(b.subtitle || '').slice(0, 150),
          sanitizeUrl(b.logo_url),
          sanitizeUrl(b.url),
          b.testimonial_text ? String(b.testimonial_text).slice(0, 1500) : null,
          Math.min(Math.max(Number(b.testimonial_rating) || 5, 1), 5),
          Number(b.order_idx) || 0,
          b.visible !== false ? 1 : 0,
          id
        )
        .run();
      return jsonResponse({ ok: true });
    }
    if (pfMatch && method === 'DELETE') {
      await DB.prepare('DELETE FROM proof_items WHERE id=?').bind(parseInt(pfMatch[1])).run();
      return jsonResponse({ ok: true });
    }

    // ── FAQs (AEO / GEO) ──────────────────────────────────────────────
    if (path === '/faqs' && method === 'GET') {
      const faqs = await getFaqs(DB);
      return jsonResponse({ faqs });
    }
    if (path === '/faqs' && method === 'POST') {
      const b = (await request.json()) as any;
      if (!b.question || !b.answer) return badRequest('question and answer required');
      await DB.prepare('INSERT INTO faqs (question, answer, order_idx, visible) VALUES (?, ?, ?, ?)')
        .bind(String(b.question).slice(0, 300), String(b.answer).slice(0, 2000), Number(b.order_idx) || 0, b.visible !== false ? 1 : 0)
        .run();
      return jsonResponse({ ok: true });
    }
    const fqMatch = path.match(/^\/faqs\/(\d+)$/);
    if (fqMatch && method === 'PUT') {
      const id = parseInt(fqMatch[1]);
      const b = (await request.json()) as any;
      await DB.prepare('UPDATE faqs SET question=?, answer=?, order_idx=?, visible=? WHERE id=?')
        .bind(String(b.question).slice(0, 300), String(b.answer).slice(0, 2000), Number(b.order_idx) || 0, b.visible !== false ? 1 : 0, id)
        .run();
      return jsonResponse({ ok: true });
    }
    if (fqMatch && method === 'DELETE') {
      await DB.prepare('DELETE FROM faqs WHERE id=?').bind(parseInt(fqMatch[1])).run();
      return jsonResponse({ ok: true });
    }

    // ── Inbox ─────────────────────────────────────────────────────────
    if (path === '/inbox' && method === 'GET') {
      const submissions = await getSubmissions(DB);
      return jsonResponse({ submissions });
    }
    const rdMatch = path.match(/^\/inbox\/(\d+)\/read$/);
    if (rdMatch && method === 'POST') {
      await markSubmissionRead(DB, parseInt(rdMatch[1]));
      return jsonResponse({ ok: true });
    }

    // ── Password Change (Revokes all other sessions) ──────────────────
    if (path === '/change-password' && method === 'POST') {
      const { current_password, new_password } = (await request.json()) as any;
      if (!current_password || !new_password) return badRequest('Both fields required');
      if (String(new_password).length < 8) return badRequest('Password must be at least 8 characters');
      const user = await DB.prepare('SELECT * FROM admin_users WHERE id=?')
        .bind(session.user_id)
        .first<any>();
      if (!user) return badRequest('User not found');
      const ok = await verifyPassword(String(current_password), user.password_hash);
      if (!ok) return badRequest('Current password is incorrect');
      const newHash = await hashPassword(String(new_password));
      await DB.prepare('UPDATE admin_users SET password_hash=? WHERE id=?')
        .bind(newHash, session.user_id)
        .run();
      // Invalidate any other sessions for this user across other devices
      await revokeOtherSessions(DB, session.user_id, session.session_id);
      await logAction(DB, 'password_changed', { user_id: session.user_id });
      return jsonResponse({ ok: true });
    }

    // ── Two-Factor Authentication (2FA TOTP) Management ───────────────
    if (path === '/2fa/status' && method === 'GET') {
      await DB.prepare('ALTER TABLE admin_users ADD COLUMN totp_secret TEXT').run().catch(() => {});
      await DB.prepare('ALTER TABLE admin_users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0').run().catch(() => {});
      const user = await DB.prepare('SELECT totp_enabled FROM admin_users WHERE id=?')
        .bind(session.user_id)
        .first<{ totp_enabled: number }>();
      const envTotp = Boolean(getEnvSecret(env, 'ADMIN_TOTP_SECRET'));
      return jsonResponse({
        enabled: Boolean(user?.totp_enabled) || envTotp,
        db_enabled: Boolean(user?.totp_enabled),
        env_enforced: envTotp,
      });
    }

    if (path === '/2fa/setup' && method === 'POST') {
      await DB.prepare('ALTER TABLE admin_users ADD COLUMN totp_secret TEXT').run().catch(() => {});
      await DB.prepare('ALTER TABLE admin_users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0').run().catch(() => {});
      const secret = generateTotpSecret(20);
      await DB.prepare('UPDATE admin_users SET totp_secret=?, totp_enabled=0 WHERE id=?')
        .bind(secret, session.user_id)
        .run();
      const otpauthUri = buildOtpAuthUri(session.username, secret, 'GK Portfolio');
      return jsonResponse({ ok: true, secret, otpauth_uri: otpauthUri });
    }

    if (path === '/2fa/enable' && method === 'POST') {
      const { code } = (await request.json()) as { code?: string };
      if (!code) return badRequest('6-digit verification code is required');
      const user = await DB.prepare('SELECT totp_secret FROM admin_users WHERE id=?')
        .bind(session.user_id)
        .first<{ totp_secret: string | null }>();
      if (!user?.totp_secret) return badRequest('Please click Setup 2FA first');
      const valid = await verifyTotpCode(user.totp_secret, String(code));
      if (!valid) return badRequest('Invalid 6-digit code. Check your authenticator app time and try again.');
      await DB.prepare('UPDATE admin_users SET totp_enabled=1 WHERE id=?').bind(session.user_id).run();
      await logAction(DB, '2fa_enabled', { user_id: session.user_id });
      return jsonResponse({ ok: true });
    }

    if (path === '/2fa/disable' && method === 'POST') {
      const { current_password } = (await request.json()) as { current_password?: string };
      if (!current_password) return badRequest('Current password is required to disable 2FA');
      const user = await DB.prepare('SELECT password_hash FROM admin_users WHERE id=?')
        .bind(session.user_id)
        .first<{ password_hash: string }>();
      if (!user) return badRequest('User not found');
      const ok = await verifyPassword(String(current_password), user.password_hash);
      if (!ok) return badRequest('Incorrect password');
      await DB.prepare('UPDATE admin_users SET totp_enabled=0, totp_secret=NULL WHERE id=?')
        .bind(session.user_id)
        .run();
      await logAction(DB, '2fa_disabled', { user_id: session.user_id });
      return jsonResponse({ ok: true });
    }

    // ── Backup Export ─────────────────────────────────────────────────
    if (path === '/backup/export' && method === 'GET') {
      const [settings, sections, skills, services, experiences, education, projects, proof, faqs] =
        await Promise.all([
          getAllSettings(DB),
          getSections(DB),
          getSkills(DB),
          getServices(DB),
          getExperiences(DB),
          getEducation(DB),
          getProjects(DB),
          getProofItems(DB),
          getFaqs(DB),
        ]);
      return jsonResponse({
        exported_at: new Date().toISOString(),
        settings,
        sections,
        skills,
        services,
        experiences,
        education,
        projects,
        proof,
        faqs,
      });
    }

    // ── Backup Import / Restore ───────────────────────────────────────
    if (path === '/backup/import' && method === 'POST') {
      const data = (await request.json()) as any;
      if (!data.settings || typeof data.settings !== 'object') {
        return badRequest('Invalid backup file — missing settings key');
      }

      const allowedSettings = ['global', 'hero', 'about', 'contact', 'seo', 'theme', 'nav', 'proof_section', 'copy'];
      for (const [k, v] of Object.entries(data.settings)) {
        if (allowedSettings.includes(k)) {
          await setSetting(DB, k, v);
        }
      }

      if (Array.isArray(data.sections)) {
        await DB.batch(
          data.sections.map((s: any) =>
            DB.prepare('INSERT OR REPLACE INTO sections (id, label, order_idx, visible) VALUES (?, ?, ?, ?)').bind(
              s.id,
              s.label,
              s.order_idx,
              s.visible ? 1 : 0
            )
          )
        );
      }

      if (Array.isArray(data.skills)) {
        await DB.prepare('DELETE FROM skill_pills').run();
        await DB.prepare('DELETE FROM skills').run();
        for (const sk of data.skills) {
          await DB.prepare('INSERT INTO skills (id, label, icon, order_idx, visible) VALUES (?, ?, ?, ?, ?)')
            .bind(sk.id, sk.label, sk.icon || 'code', sk.order_idx || 0, sk.visible !== false ? 1 : 0)
            .run();
          for (const p of sk.pills || []) {
            await DB.prepare(
              'INSERT INTO skill_pills (skill_id, label, is_hot, order_idx) VALUES (?, ?, ?, ?)'
            )
              .bind(sk.id, p.label, p.is_hot ? 1 : 0, p.order_idx || 0)
              .run();
          }
        }
      }

      if (Array.isArray(data.services)) {
        await DB.prepare('DELETE FROM services').run();
        for (const s of data.services) {
          const sFeatures = Array.isArray(s.features) ? s.features : (typeof s.features === 'string' ? safeJSON(s.features, []) : []);
          await DB.prepare(
            'INSERT INTO services (id, icon, title, slug, description, long_description, features, cta_label, cta_url, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              s.id,
              s.icon || 'build',
              s.title,
              s.slug || null,
              s.description || '',
              s.long_description || '',
              JSON.stringify(sFeatures),
              s.cta_label || null,
              sanitizeUrl(s.cta_url),
              s.order_idx || 0,
              s.visible !== false ? 1 : 0
            )
            .run();
        }
      }

      if (Array.isArray(data.experiences)) {
        await DB.prepare('DELETE FROM experiences').run();
        for (const x of data.experiences) {
          await DB.prepare(
            'INSERT INTO experiences (id, badge_label, badge_type, icon, title, company, date_range, duration, location, bullet_points, tags, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              x.id,
              x.badge_label || '',
              x.badge_type || 'lime',
              x.icon || 'work',
              x.title,
              x.company,
              x.date_range || '',
              x.duration || '',
              x.location || '',
              JSON.stringify(x.bullet_points || []),
              JSON.stringify(x.tags || []),
              x.order_idx || 0,
              x.visible !== false ? 1 : 0
            )
            .run();
        }
      }

      if (Array.isArray(data.education)) {
        await DB.prepare('DELETE FROM education').run();
        for (const e of data.education) {
          await DB.prepare(
            'INSERT INTO education (id, period, degree, stream, school, grade, items, pills, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              e.id,
              e.period || '',
              e.degree,
              e.stream || '',
              e.school || '',
              e.grade || 'In Progress',
              JSON.stringify(e.items || []),
              JSON.stringify(e.pills || []),
              e.order_idx || 0,
              e.visible !== false ? 1 : 0
            )
            .run();
        }
      }

      if (Array.isArray(data.projects)) {
        await DB.prepare('DELETE FROM projects').run();
        for (const p of data.projects) {
          await DB.prepare(
            'INSERT INTO projects (id, title, slug, problem, solution, result, category, category_icon, summary, tags, stack, status, featured, external_url, github_url, demo_url, image_url, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              p.id,
              p.title,
              p.slug || null,
              p.problem || '',
              p.solution || '',
              p.result || '',
              p.category || '',
              p.category_icon || 'folder',
              p.summary || '',
              JSON.stringify(Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? safeJSON(p.tags, []) : [])),
              JSON.stringify(Array.isArray(p.stack) ? p.stack : (typeof p.stack === 'string' ? safeJSON(p.stack, []) : [])),
              p.status || 'completed',
              p.featured ? 1 : 0,
              sanitizeUrl(p.external_url),
              sanitizeUrl(p.github_url),
              sanitizeUrl(p.demo_url),
              sanitizeUrl(p.image_url),
              p.order_idx || 0,
              p.visible !== false ? 1 : 0
            )
            .run();
        }
      }

      if (Array.isArray(data.proof)) {
        await DB.prepare('DELETE FROM proof_items').run();
        for (const pr of data.proof) {
          await DB.prepare(
            'INSERT INTO proof_items (id, type, name, subtitle, logo_url, url, testimonial_text, testimonial_rating, order_idx, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              pr.id,
              pr.type || 'org',
              pr.name,
              pr.subtitle || '',
              sanitizeUrl(pr.logo_url),
              sanitizeUrl(pr.url),
              pr.testimonial_text || null,
              pr.testimonial_rating || 5,
              pr.order_idx || 0,
              pr.visible !== false ? 1 : 0
            )
            .run();
        }
      }

      if (Array.isArray(data.faqs)) {
        await DB.prepare('DELETE FROM faqs').run();
        for (const fq of data.faqs) {
          await DB.prepare('INSERT INTO faqs (id, question, answer, order_idx, visible) VALUES (?, ?, ?, ?, ?)')
            .bind(fq.id, fq.question, fq.answer, fq.order_idx || 0, fq.visible !== false ? 1 : 0)
            .run();
        }
      }

      await logAction(DB, 'backup_restored', { imported_at: new Date().toISOString() });
      return jsonResponse({ ok: true, restored: new Date().toISOString() });
    }

    return notFound('Admin API route not found');
  } catch (err: any) {
    console.error('Admin API error:', err);
    return serverError(err?.message || 'Internal error');
  }
};
