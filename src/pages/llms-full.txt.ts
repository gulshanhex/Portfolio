import type { APIRoute } from 'astro';
import { getSiteData, stripHtml } from '../lib/db';

/**
 * Comprehensive GEO /llms-full.txt endpoint containing complete structured
 * details on the portfolio owner's background, services, skills, internships,
 * education, projects, testimonials, and FAQs.
 */
export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  const data = await getSiteData(db);
  const g = data.settings.global || {};
  const hero = data.settings.hero || {};
  const about = data.settings.about || {};
  const contact = data.settings.contact || {};
  const name = g.name || 'Your Name';
  const tagline = g.tagline || 'Automation & AI Systems Engineer';
  const location = g.location || 'Remote';
  const base = (data.settings.seo?.canonical || g.portfolio || 'https://portfolio.example.com').replace(/\/$/, '');

  const sections: string[] = [];

  sections.push(`# ${name} — Complete Engineering & Portfolio Profile`);
  sections.push(`- **Role**: ${tagline}`);
  sections.push(`- **Location**: ${location}`);
  sections.push(`- **Status**: ${contact.availability_badge || hero.status_label || 'Available for projects'} (${hero.status_chip || 'OPEN TO WORK'})`);
  sections.push(`- **Canonical URL**: ${base}`);
  sections.push(`- **Work Archive**: ${base}/work`);
  if (contact.email) sections.push(`- **Email**: ${contact.email}`);
  if (contact.github) sections.push(`- **GitHub**: ${contact.github}`);
  if (contact.linkedin) sections.push(`- **LinkedIn**: ${contact.linkedin}`);
  if (contact.main_site || g.domain) sections.push(`- **Main Website**: ${contact.main_site || g.domain}`);

  sections.push(`\n## Biography & Engineering Philosophy`);
  for (const p of about.paragraphs || []) {
    sections.push(stripHtml(p));
  }
  if (about.quote) {
    sections.push(`> "${stripHtml(about.quote)}"`);
  }

  sections.push(`\n## Engineering Services`);
  for (const s of data.services || []) {
    const sSlug = s.slug || '';
    const link = sSlug ? ` (${base}/services/${sSlug})` : '';
    let svcText = `### ${s.title}${link}\n${stripHtml(s.description)}`;
    if (s.long_description) {
      svcText += `\n\n${stripHtml(s.long_description)}`;
    }
    if (s.features && s.features.length > 0) {
      svcText += `\n\n**Key Features & Capabilities:**\n` + s.features.map((f: string) => `- ${stripHtml(f)}`).join('\n');
    }
    sections.push(svcText);
  }

  sections.push(`\n## Technical Skills & Competencies`);
  for (const sk of data.skills || []) {
    const pills = (sk.pills || []).map((p: any) => (p.is_hot ? `${p.label} (Core)` : p.label)).join(', ');
    sections.push(`- **${sk.label}**: ${pills}`);
  }

  sections.push(`\n## Industrial & Engineering Work Experience`);
  for (const xp of data.experiences || []) {
    sections.push(`### ${xp.title} — ${xp.company}`);
    sections.push(`- **Period**: ${xp.date_range} (${xp.duration})`);
    sections.push(`- **Location**: ${xp.location}`);
    for (const bp of xp.bullet_points || []) {
      sections.push(`  - ${stripHtml(bp)}`);
    }
    sections.push(`- **Technologies**: ${(xp.tags || []).join(', ')}`);
  }

  sections.push(`\n## Education`);
  for (const ed of data.education || []) {
    sections.push(`### ${ed.degree} (${ed.stream}) — ${ed.school}`);
    sections.push(`- **Period**: ${ed.period} | **Status/Grade**: ${ed.grade}`);
    for (const it of ed.items || []) {
      sections.push(`  - ${stripHtml(it)}`);
    }
  }

  sections.push(`\n## Featured & Selected Projects`);
  for (const pr of data.projects || []) {
    const pSlug = pr.slug || '';
    const link = pSlug ? ` (${base}/work/${pSlug})` : '';
    let projText = `### ${pr.title} (${pr.category})${link}\n${stripHtml(pr.summary)}`;
    if (pr.problem) projText += `\n\n- **Challenge**: ${stripHtml(pr.problem)}`;
    if (pr.solution) projText += `\n- **Implementation**: ${stripHtml(pr.solution)}`;
    if (pr.result) projText += `\n- **Outcome**: ${stripHtml(pr.result)}`;
    projText += `\n- **Tech Stack**: ${(pr.stack || []).join(', ')}`;
    if (pr.github_url) projText += `\n- **GitHub**: ${pr.github_url}`;
    if (pr.demo_url) projText += `\n- **Live Demo**: ${pr.demo_url}`;
    sections.push(projText);
  }

  const testimonials = (data.proof || []).filter((p: any) => p.type === 'testimonial' && p.testimonial_text);
  if (testimonials.length > 0) {
    sections.push(`\n## Testimonials`);
    for (const t of testimonials) {
      sections.push(`> "${stripHtml(t.testimonial_text)}"\n> — **${t.name}**, ${t.subtitle}`);
    }
  }

  if ((data.faqs || []).length > 0) {
    sections.push(`\n## Frequently Asked Questions (AEO)`);
    for (const fq of data.faqs || []) {
      sections.push(`### Q: ${fq.question}\nA: ${stripHtml(fq.answer)}`);
    }
  }

  return new Response(sections.join('\n\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
