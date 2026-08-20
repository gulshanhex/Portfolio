// ── Admin API Handlers ────────────────────────────────────────────────────
// All routes require valid session. Called from worker.js after auth check.

import {
  getSetting, setSetting, getAllSettings, getSections, getSkills,
  getServices, getExperiences, getEducation, getProjects, getProofItems,
  getSubmissions, markSubmissionRead, getDashboardStats,
  updateAdminPassword, logAction, safeJSON
} from '../lib/db.js';
import { verifyPassword, hashPassword } from '../lib/auth.js';
import { jsonResponse, badRequest, notFound, serverError } from '../lib/response.js';

// ── Route Dispatcher ──────────────────────────────────────────────────────
export async function handleAdminApi(request, env, session) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/admin/, '').replace(/\/$/, '') || '/';
  const method = request.method;
  const DB = env.DB;

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
      const body = await request.json();
      const allowed = ['global','hero','about','contact','seo','theme','nav','proof_section'];
      for (const key of Object.keys(body)) {
        if (!allowed.includes(key)) continue;
        await setSetting(DB, key, body[key]);
      }
      await logAction(DB, 'settings_updated', { keys: Object.keys(body) });
      return jsonResponse({ ok: true });
    }

    // ── Sections ──────────────────────────────────────────────────────
    if (path === '/sections' && method === 'GET') {
      const sections = await getSections(DB);
      return jsonResponse({ sections });
    }
    if (path === '/sections' && method === 'PUT') {
      const { sections } = await request.json();
      if (!Array.isArray(sections)) return badRequest('sections must be array');
      const stmt = DB.prepare('UPDATE sections SET order_idx=?, visible=? WHERE id=?');
      await DB.batch(sections.map(s => stmt.bind(s.order_idx, s.visible ? 1 : 0, s.id)));
      return jsonResponse({ ok: true });
    }

    // ── Skills ────────────────────────────────────────────────────────
    if (path === '/skills' && method === 'GET') {
      const skills = await getSkills(DB);
      return jsonResponse({ skills });
    }
    if (path === '/skills' && method === 'POST') {
      const b = await request.json();
      if (!b.label) return badRequest('label required');
      const result = await DB.prepare(
        'INSERT INTO skills (label,icon,order_idx,visible) VALUES (?,?,?,?)'
      ).bind(b.label, b.icon||'code', b.order_idx||0, b.visible!==false?1:0).run();
      const skillId = result.meta.last_row_id;
      if (Array.isArray(b.pills) && b.pills.length) {
        await DB.batch(b.pills.map((p, i) =>
          DB.prepare('INSERT INTO skill_pills (skill_id,label,is_hot,order_idx) VALUES (?,?,?,?)')
            .bind(skillId, p.label, p.is_hot?1:0, p.order_idx??i)
        ));
      }
      return jsonResponse({ ok: true, id: skillId });
    }
    if (path.match(/^\/skills\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const b = await request.json();
      await DB.prepare('UPDATE skills SET label=?,icon=?,order_idx=?,visible=? WHERE id=?')
        .bind(b.label, b.icon||'code', b.order_idx||0, b.visible!==false?1:0, id).run();
      // Replace pills
      await DB.prepare('DELETE FROM skill_pills WHERE skill_id=?').bind(id).run();
      if (Array.isArray(b.pills) && b.pills.length) {
        await DB.batch(b.pills.map((p, i) =>
          DB.prepare('INSERT INTO skill_pills (skill_id,label,is_hot,order_idx) VALUES (?,?,?,?)')
            .bind(id, p.label, p.is_hot?1:0, p.order_idx??i)
        ));
      }
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/skills\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      await DB.prepare('DELETE FROM skills WHERE id=?').bind(id).run();
      return jsonResponse({ ok: true });
    }

    // ── Services ──────────────────────────────────────────────────────
    if (path === '/services' && method === 'GET') {
      const services = await getServices(DB);
      return jsonResponse({ services });
    }
    if (path === '/services' && method === 'POST') {
      const b = await request.json();
      if (!b.title) return badRequest('title required');
      await DB.prepare('INSERT INTO services (icon,title,description,cta_label,cta_url,order_idx,visible) VALUES (?,?,?,?,?,?,?)')
        .bind(b.icon||'build', b.title, b.description||'', b.cta_label||null, b.cta_url||null, b.order_idx||0, b.visible!==false?1:0).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/services\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const b = await request.json();
      await DB.prepare('UPDATE services SET icon=?,title=?,description=?,cta_label=?,cta_url=?,order_idx=?,visible=? WHERE id=?')
        .bind(b.icon||'build', b.title, b.description||'', b.cta_label||null, b.cta_url||null, b.order_idx||0, b.visible!==false?1:0, id).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/services\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      await DB.prepare('DELETE FROM services WHERE id=?').bind(id).run();
      return jsonResponse({ ok: true });
    }

    // ── Experiences ───────────────────────────────────────────────────
    if (path === '/experiences' && method === 'GET') {
      const experiences = await getExperiences(DB);
      return jsonResponse({ experiences });
    }
    if (path === '/experiences' && method === 'POST') {
      const b = await request.json();
      if (!b.title || !b.company) return badRequest('title and company required');
      await DB.prepare(
        'INSERT INTO experiences (badge_label,badge_type,icon,title,company,date_range,duration,location,bullet_points,tags,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
      ).bind(b.badge_label||'', b.badge_type||'lime', b.icon||'work', b.title, b.company,
        b.date_range||'', b.duration||'', b.location||'',
        JSON.stringify(b.bullet_points||[]), JSON.stringify(b.tags||[]),
        b.order_idx||0, b.visible!==false?1:0).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/experiences\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const b = await request.json();
      await DB.prepare(
        'UPDATE experiences SET badge_label=?,badge_type=?,icon=?,title=?,company=?,date_range=?,duration=?,location=?,bullet_points=?,tags=?,order_idx=?,visible=? WHERE id=?'
      ).bind(b.badge_label||'', b.badge_type||'lime', b.icon||'work', b.title, b.company,
        b.date_range||'', b.duration||'', b.location||'',
        JSON.stringify(b.bullet_points||[]), JSON.stringify(b.tags||[]),
        b.order_idx||0, b.visible!==false?1:0, id).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/experiences\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      await DB.prepare('DELETE FROM experiences WHERE id=?').bind(id).run();
      return jsonResponse({ ok: true });
    }

    // ── Education ─────────────────────────────────────────────────────
    if (path === '/education' && method === 'GET') {
      const education = await getEducation(DB);
      return jsonResponse({ education });
    }
    if (path === '/education' && method === 'POST') {
      const b = await request.json();
      if (!b.degree) return badRequest('degree required');
      await DB.prepare(
        'INSERT INTO education (period,degree,stream,school,grade,items,pills,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?)'
      ).bind(b.period||'', b.degree, b.stream||'', b.school||'', b.grade||'In Progress',
        JSON.stringify(b.items||[]), JSON.stringify(b.pills||[]),
        b.order_idx||0, b.visible!==false?1:0).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/education\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const b = await request.json();
      await DB.prepare(
        'UPDATE education SET period=?,degree=?,stream=?,school=?,grade=?,items=?,pills=?,order_idx=?,visible=? WHERE id=?'
      ).bind(b.period||'', b.degree, b.stream||'', b.school||'', b.grade||'In Progress',
        JSON.stringify(b.items||[]), JSON.stringify(b.pills||[]),
        b.order_idx||0, b.visible!==false?1:0, id).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/education\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      await DB.prepare('DELETE FROM education WHERE id=?').bind(id).run();
      return jsonResponse({ ok: true });
    }

    // ── Projects ──────────────────────────────────────────────────────
    if (path === '/projects' && method === 'GET') {
      const projects = await getProjects(DB);
      return jsonResponse({ projects });
    }
    if (path === '/projects' && method === 'POST') {
      const b = await request.json();
      if (!b.title) return badRequest('title required');
      await DB.prepare(
        'INSERT INTO projects (title,category,category_icon,summary,tags,stack,status,featured,external_url,github_url,demo_url,image_url,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
      ).bind(b.title, b.category||'', b.category_icon||'folder', b.summary||'',
        JSON.stringify(b.tags||[]), JSON.stringify(b.stack||[]),
        b.status||'completed', b.featured?1:0,
        b.external_url||null, b.github_url||null, b.demo_url||null, b.image_url||null,
        b.order_idx||0, b.visible!==false?1:0).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/projects\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const b = await request.json();
      await DB.prepare(
        'UPDATE projects SET title=?,category=?,category_icon=?,summary=?,tags=?,stack=?,status=?,featured=?,external_url=?,github_url=?,demo_url=?,image_url=?,order_idx=?,visible=? WHERE id=?'
      ).bind(b.title, b.category||'', b.category_icon||'folder', b.summary||'',
        JSON.stringify(b.tags||[]), JSON.stringify(b.stack||[]),
        b.status||'completed', b.featured?1:0,
        b.external_url||null, b.github_url||null, b.demo_url||null, b.image_url||null,
        b.order_idx||0, b.visible!==false?1:0, id).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/projects\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      await DB.prepare('DELETE FROM projects WHERE id=?').bind(id).run();
      return jsonResponse({ ok: true });
    }

    // ── Proof Items ───────────────────────────────────────────────────
    if (path === '/proof' && method === 'GET') {
      const items = await getProofItems(DB);
      const settings = await getAllSettings(DB);
      return jsonResponse({ items, settings });
    }
    if (path === '/proof' && method === 'POST') {
      const b = await request.json();
      if (!b.name) return badRequest('name required');
      await DB.prepare(
        'INSERT INTO proof_items (type,name,subtitle,logo_url,url,testimonial_text,testimonial_rating,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?)'
      ).bind(b.type||'org', b.name, b.subtitle||'', b.logo_url||null, b.url||null,
        b.testimonial_text||null, b.testimonial_rating||5,
        b.order_idx||0, b.visible!==false?1:0).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/proof\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[2]);
      const b = await request.json();
      await DB.prepare(
        'UPDATE proof_items SET type=?,name=?,subtitle=?,logo_url=?,url=?,testimonial_text=?,testimonial_rating=?,order_idx=?,visible=? WHERE id=?'
      ).bind(b.type||'org', b.name, b.subtitle||'', b.logo_url||null, b.url||null,
        b.testimonial_text||null, b.testimonial_rating||5,
        b.order_idx||0, b.visible!==false?1:0, id).run();
      return jsonResponse({ ok: true });
    }
    if (path.match(/^\/proof\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[2]);
      await DB.prepare('DELETE FROM proof_items WHERE id=?').bind(id).run();
      return jsonResponse({ ok: true });
    }

    // ── Inbox ─────────────────────────────────────────────────────────
    if (path === '/inbox' && method === 'GET') {
      const submissions = await getSubmissions(DB);
      return jsonResponse({ submissions });
    }
    if (path.match(/^\/inbox\/\d+\/read$/) && method === 'POST') {
      const id = parseInt(path.split('/')[2]);
      await markSubmissionRead(DB, id);
      return jsonResponse({ ok: true });
    }

    // ── Password Change ───────────────────────────────────────────────
    if (path === '/change-password' && method === 'POST') {
      const { current_password, new_password } = await request.json();
      if (!current_password || !new_password) return badRequest('Both fields required');
      if (new_password.length < 8) return badRequest('Password must be at least 8 characters');
      const user = await DB.prepare('SELECT * FROM admin_users WHERE id=?').bind(session.user_id).first();
      if (!user) return badRequest('User not found');
      const ok = await verifyPassword(current_password, user.password_hash);
      if (!ok) return badRequest('Current password is incorrect');
      const newHash = await hashPassword(new_password);
      await DB.prepare('UPDATE admin_users SET password_hash=? WHERE id=?').bind(newHash, session.user_id).run();
      await logAction(DB, 'password_changed', { user_id: session.user_id });
      return jsonResponse({ ok: true });
    }

    // ── Backup Export ─────────────────────────────────────────────────
    if (path === '/backup/export' && method === 'GET') {
      const [settings, sections, skills, services, experiences, education, projects, proof] = await Promise.all([
        getAllSettings(DB), getSections(DB), getSkills(DB), getServices(DB),
        getExperiences(DB), getEducation(DB), getProjects(DB), getProofItems(DB)
      ]);
      return jsonResponse({ exported_at: new Date().toISOString(), settings, sections, skills, services, experiences, education, projects, proof });
    }

    // ── Backup Import ─────────────────────────────────────────────────
    if (path === '/backup/import' && method === 'POST') {
      const data = await request.json();
      if (!data.settings) return badRequest('Invalid backup file');
      // Restore settings
      for (const [key, value] of Object.entries(data.settings)) {
        await setSetting(DB, key, value);
      }
      // Restore sections
      if (Array.isArray(data.sections)) {
        await DB.batch(data.sections.map(s =>
          DB.prepare('INSERT OR REPLACE INTO sections (id,label,order_idx,visible) VALUES (?,?,?,?)')
            .bind(s.id, s.label, s.order_idx, s.visible)
        ));
      }
      // Clear and restore list tables
      const tables = { skills:'skills', services:'services', experiences:'experiences', education:'education', projects:'projects', proof:'proof_items' };
      for (const [key, table] of Object.entries(tables)) {
        if (!Array.isArray(data[key])) continue;
        await DB.prepare(`DELETE FROM ${table}`).run();
        if (table === 'skills') await DB.prepare('DELETE FROM skill_pills').run();
      }
      for (const svc of (data.services||[])) {
        await DB.prepare('INSERT INTO services (id,icon,title,description,cta_label,cta_url,order_idx,visible) VALUES (?,?,?,?,?,?,?,?)')
          .bind(svc.id,svc.icon||'build',svc.title,svc.description||'',svc.cta_label||null,svc.cta_url||null,svc.order_idx||0,svc.visible!==false?1:0).run();
      }
      for (const x of (data.experiences||[])) {
        await DB.prepare('INSERT INTO experiences (id,badge_label,badge_type,icon,title,company,date_range,duration,location,bullet_points,tags,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .bind(x.id,x.badge_label||'',x.badge_type||'lime',x.icon||'work',x.title,x.company,x.date_range||'',x.duration||'',x.location||'',JSON.stringify(x.bullet_points||[]),JSON.stringify(x.tags||[]),x.order_idx||0,x.visible!==false?1:0).run();
      }
      for (const e of (data.education||[])) {
        await DB.prepare('INSERT INTO education (id,period,degree,stream,school,grade,items,pills,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?)')
          .bind(e.id,e.period||'',e.degree,e.stream||'',e.school||'',e.grade||'',JSON.stringify(e.items||[]),JSON.stringify(e.pills||[]),e.order_idx||0,e.visible!==false?1:0).run();
      }
      for (const p of (data.projects||[])) {
        await DB.prepare('INSERT INTO projects (id,title,category,category_icon,summary,tags,stack,status,featured,external_url,github_url,demo_url,image_url,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .bind(p.id,p.title,p.category||'',p.category_icon||'folder',p.summary||'',JSON.stringify(p.tags||[]),JSON.stringify(p.stack||[]),p.status||'completed',p.featured?1:0,p.external_url||null,p.github_url||null,p.demo_url||null,p.image_url||null,p.order_idx||0,p.visible!==false?1:0).run();
      }
      for (const pr of (data.proof||[])) {
        await DB.prepare('INSERT INTO proof_items (id,type,name,subtitle,logo_url,url,testimonial_text,testimonial_rating,order_idx,visible) VALUES (?,?,?,?,?,?,?,?,?,?)')
          .bind(pr.id,pr.type||'org',pr.name,pr.subtitle||'',pr.logo_url||null,pr.url||null,pr.testimonial_text||null,pr.testimonial_rating||5,pr.order_idx||0,pr.visible!==false?1:0).run();
      }
      for (const sk of (data.skills||[])) {
        await DB.prepare('INSERT INTO skills (id,label,icon,order_idx,visible) VALUES (?,?,?,?,?)')
          .bind(sk.id,sk.label,sk.icon||'code',sk.order_idx||0,sk.visible!==false?1:0).run();
        for (const p of (sk.pills||[])) {
          await DB.prepare('INSERT INTO skill_pills (skill_id,label,is_hot,order_idx) VALUES (?,?,?,?)')
            .bind(sk.id,p.label,p.is_hot?1:0,p.order_idx||0).run();
        }
      }
      await logAction(DB, 'backup_restored', { imported_at: new Date().toISOString() });
      return jsonResponse({ ok: true });
    }

    return notFound('Admin API route not found');
  } catch (err) {
    console.error('Admin API error:', err);
    return serverError(err.message || 'Internal error');
  }
}
