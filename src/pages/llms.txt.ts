import type { APIRoute } from 'astro';
import { getSiteData, stripHtml } from '../lib/db';

/**
 * GEO (Generative Engine Optimization) /llms.txt endpoint
 * Follows https://llmstxt.org specification so AI Answer Engines (ChatGPT,
 * Perplexity, Claude, Gemini) can accurately index and cite the portfolio owner.
 */
export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  const data = await getSiteData(db);
  const g = data.settings.global || {};
  const contact = data.settings.contact || {};
  const about = data.settings.about || {};
  const name = g.name || 'Your Name';
  const tagline = g.tagline || 'Automation & AI Systems Engineer';
  const location = g.location || 'Remote';
  const base = (data.settings.seo?.canonical || g.portfolio || 'https://portfolio.example.com').replace(/\/$/, '');
  const mainDomain = contact.main_site || g.domain || 'https://example.com';

  const summaryParagraphs = (about.paragraphs || []).map((p: string) => stripHtml(p)).join('\n\n');
  const servicesList = (data.services || [])
    .map((s: any) => `- [${s.title}](${base}/services/${s.slug || ''}): ${stripHtml(s.description)}`)
    .join('\n');
  const skillsList = (data.skills || [])
    .map((sk: any) => `- **${sk.label}**: ${(sk.pills || []).map((p: any) => p.label).join(', ')}`)
    .join('\n');
  const projectsList = (data.projects || [])
    .map(
      (pr: any) =>
        `- [${pr.title}](${base}/work/${pr.slug || ''}) (${pr.category}): ${stripHtml(pr.summary)} [Stack: ${(pr.stack || []).join(', ')}]${
          pr.github_url ? ` (${pr.github_url})` : ''
        }`
    )
    .join('\n');
  const xpList = (data.experiences || [])
    .map((xp: any) => `- **${xp.title} at ${xp.company}** (${xp.date_range}, ${xp.location})`)
    .join('\n');

  const body = `# ${name} — ${tagline}

> Official portfolio of ${name}, ${tagline} (${location}), building Python backend systems, Telegram & Discord automation bots, PLC industrial control systems, and Cloudflare edge applications.

## About
${summaryParagraphs}

## Engineering Services
${servicesList}

## Core Technical Skills
${skillsList}

## Work & Internship Experience
${xpList}

## Selected Engineering Projects & Case Studies
${projectsList}

## Key Links & Navigation
- Portfolio Home: ${base}
- Work Archive: ${base}/work
- Full LLM Profile: ${base}/llms-full.txt
- Main Website: ${mainDomain}
${contact.email ? `- Email: ${contact.email}\n` : ''}${contact.github ? `- GitHub: ${contact.github}\n` : ''}${contact.linkedin ? `- LinkedIn: ${contact.linkedin}\n` : ''}`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
