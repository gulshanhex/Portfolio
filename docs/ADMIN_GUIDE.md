# Admin Panel & Interface Text Guide

The `/admin` control plane gives the portfolio owner 100% control over every section, item, theme setting, SEO tag, and interface text string on the site.

## 1. Admin Panels Overview

| Sidebar Group | Panel Name | What It Controls |
| :--- | :--- | :--- |
| **Overview** | **Dashboard** | Project/experience/message counts, unread inbox badge, quick actions, and active site summary |
| **Content** | **Global Settings** | Owner name, site name, tagline, location, footer HTML text, domains, editable **Footer Links** (add/remove/reorder), and resume URL/toggle |
| **Content** | **Hero & About** | Headline lines 1 & 2, primary headline, subheadline, role text, status label & chip, primary/secondary CTAs, **Hero Visual Card** (show toggle, layout variant `"chat+chart" \| "chart" \| "none"`, and all 19 card text fields), quick stats, about paragraphs, and pull quote |
| **Content** | **Section Copy** | Eyebrow, heading title, and subtitle for About, Services, Skills, Experience, Education, Projects, Proof, FAQ, and Contact sections |
| **Content** | **Interface Text** | Automatic form generated from `src/lib/ui-strings.ts` covering all 117 UI strings across 11 collapsible groups with live search and per-field reset |
| **Content** | **Skills** | Skill categories, Material icons, display order, visibility, and highlighted (`*`) skill pills |
| **Content** | **Services** | Service cards and standalone `/services/[slug]` pages (`slug`, short description, long description, key features list, custom CTA) |
| **Content** | **Experience** | Work & internship timeline entries (`badge_label`, `badge_type`, `date_range`, `duration`, `location`, HTML-capable `bullet_points`, `tags`) |
| **Content** | **Education** | Academic entries (`degree`, `stream`, `school`, `period`, `grade`, HTML-capable bullet `items`, `pills`) |
| **Content** | **Projects** | Portfolio showcase cards and `/work/[slug]` case studies (`slug`, `summary`, `problem`, `solution`, `result`, `stack`, `tags`, `github_url`, `demo_url`, `featured`) |
| **Content** | **Proof & Context** | Section heading, organizations heading & subtitle, testimonials heading, visibility toggles, organization badges, and client/mentor testimonials |
| **Content** | **FAQs (AEO/GEO)** | Questions and answers rendered on the page, in `FAQPage` Schema.org JSON-LD, and in `/llms-full.txt` |
| **Site** | **Contact Config** | Direct email, LinkedIn, GitHub, main website URL, intro text, form enable toggle, and availability badge toggle/text |
| **Site** | **Inbox** | Contact form messages stored in D1 with unread indicators and one-click mark-as-read |
| **Site** | **Sections & Order** | Drag-and-drop section ordering and per-section visibility toggles |
| **Site** | **SEO / GEO / OG** | Meta title, description, keywords, OpenGraph title/description/image, canonical URL, robots policy, JSON-LD toggle, and Review JSON-LD toggle |
| **Site** | **Theme** | Default theme (`dark`, `light`, `system`), WCAG AA accent preset (`emerald`, `teal`, `blue`, `indigo`), `Glow Intensity` (`none`, `subtle`, `balanced`, `strong`), and user theme toggle switch |
| **Admin** | **Security & 2FA** | Password change (revokes other sessions) and RFC 6238 TOTP 2FA setup/disable |
| **Admin** | **Backup & Restore** | Full JSON export and import of all settings (including `ui` overrides) and database tables |

## 2. How the "Interface Text" Panel Works

1. All public UI strings are registered in [`src/lib/ui-strings.ts`](../src/lib/ui-strings.ts) in the `UI_STRINGS` array.
2. Each entry has the shape:
   ```ts
   export interface UiStringItem {
     key: string;
     default: string;
     label: string;
     group: string;
     help?: string;
     multiline?: boolean;
     allowHtml?: boolean;
   }
   ```
3. In `/admin` → **Interface Text**:
   - Entries are automatically grouped into collapsible `<details>` sections by `group`.
   - The search bar filters fields in real time by label, key, group, default value, or current override.
   - Each field displays its `default` value as the input `placeholder`.
   - Clicking **Reset** on any field clears the custom override so the site falls back to `item.default`.
   - Clicking **Save Interface Text** sends `POST /api/admin/settings` with `{ ui: { ...nonDefaultValues } }` and displays a confirmation toast only after the server confirms `"ui"` in `res.saved`.

## 3. How to Add a New Editable String (1-Line Workflow)

Adding a new admin-editable string requires **one entry** in `src/lib/ui-strings.ts` and reading it with `t(settings, key)`:

1. Open [`src/lib/ui-strings.ts`](../src/lib/ui-strings.ts) and add an object to `UI_STRINGS`:
   ```ts
   {
     key: 'projects.my_custom_badge',
     default: 'Case Study',
     label: 'Custom Project Badge Text',
     group: 'Work & Case Studies',
   },
   ```
2. In your Astro component or page, import `t` and render the value:
   ```astro
   ---
   import { t } from '../lib/ui-strings';
   const badgeText = t(settings, 'projects.my_custom_badge');
   ---
   <span>{badgeText}</span>
   ```
3. That's it! The **Interface Text** admin panel, JSON backup/restore, and prebuild checks (`scripts/check-hardcoded-strings.mjs`) will automatically include the new key.
