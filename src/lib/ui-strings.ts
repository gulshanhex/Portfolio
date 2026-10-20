// ── Central UI Strings Registry & Translation/Override Helper ──────────────
// Every visible label, heading, button caption, placeholder, empty state,
// error message, and accessibility attribute on the public site is defined here
// and editable from Admin -> Interface Text (stored under site_settings.ui).

import { sanitizeBasicHtml } from './db';

export interface UiStringItem {
  key: string;
  default: string;
  label: string;
  group: string;
  help?: string;
  multiline?: boolean;
  allowHtml?: boolean;
}

export const UI_STRINGS: UiStringItem[] = [
  // ── Group 1: Accessibility & Global ─────────────────────────────────────
  {
    key: 'a11y.skip_link',
    default: 'Skip to main content',
    label: 'Skip to Content Link',
    group: 'Accessibility & Global',
    help: 'Screen-reader and keyboard skip link at top of every page.',
  },
  {
    key: 'a11y.brand_home_aria',
    default: 'Home',
    label: 'Brand Logo Aria Suffix',
    group: 'Accessibility & Global',
  },
  {
    key: 'a11y.brand_mark',
    default: 'GK',
    label: 'Brand Monogram Mark',
    group: 'Accessibility & Global',
    help: 'Short 2-letter mark displayed in header, profile avatar, and footer.',
  },
  {
    key: 'a11y.llms_summary_title',
    default: 'LLM Context Summary',
    label: 'LLMs.txt Link Title Attribute',
    group: 'Accessibility & Global',
  },
  {
    key: 'a11y.llms_full_title',
    default: 'LLM Full Context Profile',
    label: 'LLMs-Full.txt Link Title Attribute',
    group: 'Accessibility & Global',
  },

  // ── Group 2: Navigation (Top Bar & Mobile Sheet) ────────────────────────
  {
    key: 'nav.main_aria',
    default: 'Main navigation',
    label: 'Top Navigation Aria Label',
    group: 'Navigation',
  },
  {
    key: 'nav.mobile_bottom_aria',
    default: 'Mobile bottom navigation',
    label: 'Mobile Bottom Bar Aria Label',
    group: 'Navigation',
  },
  {
    key: 'nav.more_label',
    default: 'More',
    label: 'More Menu Button Label',
    group: 'Navigation',
  },
  {
    key: 'nav.cta_label',
    default: "Let's talk",
    label: 'Header Primary CTA Button',
    group: 'Navigation',
  },
  {
    key: 'nav.home_label',
    default: 'Home',
    label: 'Home Link Label',
    group: 'Navigation',
  },
  {
    key: 'nav.services_label',
    default: 'Services',
    label: 'Services Link Label',
    group: 'Navigation',
  },
  {
    key: 'nav.work_label',
    default: 'Work',
    label: 'Work Link Label',
    group: 'Navigation',
  },
  {
    key: 'nav.about_label',
    default: 'About',
    label: 'About Link Label',
    group: 'Navigation',
  },
  {
    key: 'nav.contact_label',
    default: 'Contact',
    label: 'Contact Link Label',
    group: 'Navigation',
  },
  {
    key: 'nav.resume_label',
    default: 'Resume',
    label: 'Default Resume Link Label',
    group: 'Navigation',
  },
  {
    key: 'nav.resume_pdf_suffix',
    default: '(PDF)',
    label: 'Mobile Sheet Resume Suffix',
    group: 'Navigation',
  },
  {
    key: 'nav.sheet_title',
    default: 'Portfolio Navigation',
    label: 'Mobile Drawer Heading',
    group: 'Navigation',
  },
  {
    key: 'nav.sheet_dialog_aria',
    default: 'All portfolio sections',
    label: 'Mobile Drawer Dialog Aria Label',
    group: 'Navigation',
  },
  {
    key: 'nav.sheet_close_aria',
    default: 'Close navigation sheet',
    label: 'Mobile Drawer Close Button Aria Label',
    group: 'Navigation',
  },
  {
    key: 'nav.theme_toggle_aria',
    default: 'Toggle dark or light theme',
    label: 'Theme Toggle Aria Label',
    group: 'Navigation',
  },
  {
    key: 'nav.theme_toggle_title',
    default: 'Toggle theme',
    label: 'Theme Toggle Tooltip Title',
    group: 'Navigation',
  },
  {
    key: 'nav.install_label',
    default: 'Install',
    label: 'Desktop Nav Install Button Label',
    group: 'Navigation',
  },
  {
    key: 'nav.install_app_label',
    default: 'Install app',
    label: 'Mobile Sheet & Footer Install App Label',
    group: 'Navigation',
  },
  {
    key: 'nav.install_title',
    default: 'Install portfolio application',
    label: 'Install Button Tooltip Title',
    group: 'Navigation',
  },
  {
    key: 'nav.install_aria',
    default: 'Install app',
    label: 'Install Button Aria Label',
    group: 'Navigation',
  },

  // ── Group 3: Hero & Introduction ────────────────────────────────────────
  {
    key: 'hero.section_aria',
    default: 'Introduction',
    label: 'Hero Section Aria Label',
    group: 'Hero & Introduction',
  },
  {
    key: 'hero.headline_default',
    default: 'I build bots & automation that run your business',
    label: 'Fallback Hero Headline',
    group: 'Hero & Introduction',
  },
  {
    key: 'hero.subheadline_default',
    default: 'From custom AI workflows to automated scaling—I architect system integrations that eliminate manual work.',
    label: 'Fallback Hero Subheadline',
    group: 'Hero & Introduction',
    multiline: true,
    allowHtml: true,
  },
  {
    key: 'hero.status_default',
    default: 'Available for projects',
    label: 'Fallback Availability Status Label',
    group: 'Hero & Introduction',
  },
  {
    key: 'hero.cta_primary_default',
    default: 'Start a project',
    label: 'Fallback Primary CTA Label',
    group: 'Hero & Introduction',
  },
  {
    key: 'hero.cta_secondary_work',
    default: 'View work',
    label: 'Fallback Secondary CTA Label (When Projects Exist)',
    group: 'Hero & Introduction',
  },
  {
    key: 'hero.cta_secondary_services',
    default: 'See services',
    label: 'Fallback Secondary CTA Label (When No Projects)',
    group: 'Hero & Introduction',
  },

  // ── Group 4: Hero Visual Card ───────────────────────────────────────────
  {
    key: 'hero_visual.aria_label',
    default: 'Interactive automation workflow demonstration',
    label: 'Hero Visual Container Aria Label',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.api_title',
    default: 'Automation API',
    label: 'Chart Card Title',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.api_badge',
    default: 'Active',
    label: 'Chart Card Status Badge',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.stat1_label',
    default: 'Workflows',
    label: 'Chart Metric 1 Label',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.stat1_value',
    default: 'Event-Driven',
    label: 'Chart Metric 1 Value',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.stat2_label',
    default: 'Execution',
    label: 'Chart Metric 2 Label',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.stat2_value',
    default: 'Edge Webhook',
    label: 'Chart Metric 2 Value',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.stat3_label',
    default: 'Status',
    label: 'Chart Metric 3 Label',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.stat3_value',
    default: 'Operational',
    label: 'Chart Metric 3 Value',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.connector_text',
    default: 'webhook trigger → bot dispatch',
    label: 'Pipeline Connector Pill Text',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.bot_name',
    default: 'Bot Engine',
    label: 'Chat Card Bot Name',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.bot_status',
    default: 'automated sequence',
    label: 'Chat Card Bot Subtitle',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.bot_sender',
    default: 'System Bot',
    label: 'Chat Card Sender Label',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.bot_msg1',
    default: 'Triggered scheduled operational cycle.',
    label: 'Chat Card First Bot Message',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.code_snippet',
    default: 'schedule.every().day.at("09:00").do(run_audit)',
    label: 'Chat Card Code Line',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.user_msg',
    default: 'Run status check.',
    label: 'Chat Card User Command Bubble',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.bot_reply',
    default: 'Routine check completed',
    label: 'Chat Card Bot Confirmation Bubble',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.input_placeholder',
    default: 'Write a command...',
    label: 'Chat Input Placeholder',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.send_btn',
    default: '↵',
    label: 'Chat Input Send Button Symbol',
    group: 'Hero Visual',
  },
  {
    key: 'hero_visual.caption',
    default: 'Sample automated orchestration workflow',
    label: 'Hero Visual Bottom Caption',
    group: 'Hero Visual',
  },

  // ── Group 5: About Section ──────────────────────────────────────────────
  {
    key: 'about.eyebrow_default',
    default: '// ABOUT ME',
    label: 'Default About Eyebrow',
    group: 'About Section',
  },
  {
    key: 'about.title_default',
    default: 'Who am I?',
    label: 'Default About Heading',
    group: 'About Section',
  },
  {
    key: 'about.subtitle_default',
    default: 'Engineering intelligent software that interfaces with the physical and digital world.',
    label: 'Default About Subtitle',
    group: 'About Section',
    multiline: true,
  },
  {
    key: 'about.fact_location_label',
    default: 'Base Location',
    label: 'Profile Card Location Label',
    group: 'About Section',
  },
  {
    key: 'about.fact_email_label',
    default: 'Direct Email',
    label: 'Profile Card Email Label',
    group: 'About Section',
  },
  {
    key: 'about.fact_github_label',
    default: 'GitHub',
    label: 'Profile Card GitHub Label',
    group: 'About Section',
  },
  {
    key: 'about.fact_linkedin_label',
    default: 'LinkedIn',
    label: 'Profile Card LinkedIn Label',
    group: 'About Section',
  },
  {
    key: 'about.fact_website_label',
    default: 'Website',
    label: 'Profile Card Main Website Label',
    group: 'About Section',
  },
  {
    key: 'about.fact_credentials_label',
    default: 'Credentials',
    label: 'Profile Card Resume Row Label',
    group: 'About Section',
  },
  {
    key: 'about.fact_cv_label',
    default: 'Curriculum Vitae (PDF)',
    label: 'Profile Card Resume Link Text',
    group: 'About Section',
  },

  // ── Group 6: Services & Service Detail Page ─────────────────────────────
  {
    key: 'services.eyebrow_default',
    default: '// SERVICES',
    label: 'Default Services Eyebrow',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.title_default',
    default: 'What I can do for you.',
    label: 'Default Services Heading',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.subtitle_default',
    default: 'Tailored automation, integration, and intelligence for your business.',
    label: 'Default Services Subtitle',
    group: 'Services & Detail Page',
    multiline: true,
  },
  {
    key: 'services.learn_more',
    default: 'Learn more',
    label: 'Service Card Default CTA Label',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_all_services',
    default: 'All Services',
    label: 'Service Detail Back Link Label',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_inquire_btn',
    default: 'Inquire',
    label: 'Service Detail Header CTA Button',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_breadcrumb_aria',
    default: 'Breadcrumb navigation',
    label: 'Breadcrumb Nav Aria Label',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_eyebrow',
    default: '// ENGINEERING SERVICE',
    label: 'Service Detail Page Eyebrow',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_overview_heading',
    default: 'Technical Overview',
    label: 'Service Detail Overview Heading',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_overview_fallback',
    default: 'Production-grade implementation tailored for robust systems integration. Built with resilient error handling, telemetry diagnostics, and edge deployment standards.',
    label: 'Service Detail Fallback Overview Text',
    group: 'Services & Detail Page',
    multiline: true,
  },
  {
    key: 'services.detail_features_heading',
    default: 'Key Capabilities & Standards',
    label: 'Service Detail Capabilities Heading',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_inquiry_title',
    default: 'Ready to automate?',
    label: 'Service Detail Sidebar Card Title',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_inquiry_desc',
    default: "Have a specific workflow, hardware integration, or backend requirement? Let's discuss scope and timelines.",
    label: 'Service Detail Sidebar Card Text',
    group: 'Services & Detail Page',
    multiline: true,
  },
  {
    key: 'services.detail_inquiry_btn',
    default: 'Start Discussion',
    label: 'Service Detail Sidebar CTA Button',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_inquiry_meta1',
    default: 'Direct engineering consultation',
    label: 'Service Detail Sidebar Meta Line 1',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_inquiry_meta2',
    default: 'Remote & On-site',
    label: 'Service Detail Sidebar Meta Line 2',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_related_heading',
    default: 'Other Engineering Capabilities',
    label: 'Service Detail Related Services Heading',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.detail_back_top',
    default: 'Back to top of services ↑',
    label: 'Service Detail Footer Back Link',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.not_found_eyebrow',
    default: '// 404 ERROR',
    label: 'Service Not Found Eyebrow',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.not_found_title',
    default: 'Service Not Found',
    label: 'Service Not Found Title',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.not_found_desc',
    default: "The requested service doesn't exist or is currently inactive.",
    label: 'Service Not Found Description',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.not_found_all_btn',
    default: 'View All Services',
    label: 'Service Not Found Primary Button',
    group: 'Services & Detail Page',
  },
  {
    key: 'services.not_found_home_btn',
    default: 'Return Home',
    label: 'Service Not Found Secondary Button',
    group: 'Services & Detail Page',
  },

  // ── Group 7: Skills, Experience, Education & FAQ ────────────────────────
  {
    key: 'skills.eyebrow_default',
    default: '// SKILLS',
    label: 'Default Skills Eyebrow',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'skills.title_default',
    default: 'What I work with.',
    label: 'Default Skills Heading',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'skills.subtitle_default',
    default: 'A curated set of tools, languages, and systems built through production environments and hands-on engineering.',
    label: 'Default Skills Subtitle',
    group: 'Skills, Experience, Education & FAQ',
    multiline: true,
  },
  {
    key: 'experience.eyebrow_default',
    default: '// EXPERIENCE',
    label: 'Default Experience Eyebrow',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'experience.title_default',
    default: "Where I've engineered.",
    label: 'Default Experience Heading',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'experience.subtitle_default',
    default: 'Hands-on production environments, industrial automation, and software engineering roles.',
    label: 'Default Experience Subtitle',
    group: 'Skills, Experience, Education & FAQ',
    multiline: true,
  },
  {
    key: 'education.eyebrow_default',
    default: '// EDUCATION',
    label: 'Default Education Eyebrow',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'education.title_default',
    default: 'Where I learned.',
    label: 'Default Education Heading',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'education.subtitle_default',
    default: 'Academic background and practical technical foundations.',
    label: 'Default Education Subtitle',
    group: 'Skills, Experience, Education & FAQ',
    multiline: true,
  },
  {
    key: 'faq.eyebrow_default',
    default: '// QUICK ANSWERS',
    label: 'Default FAQ Eyebrow',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'faq.title_default',
    default: 'Frequently asked questions.',
    label: 'Default FAQ Heading',
    group: 'Skills, Experience, Education & FAQ',
  },
  {
    key: 'faq.subtitle_default',
    default: 'Direct answers regarding my engineering background, industrial automation experience, and availability.',
    label: 'Default FAQ Subtitle',
    group: 'Skills, Experience, Education & FAQ',
    multiline: true,
  },

  // ── Group 8: Work, Projects & Case Study Pages ──────────────────────────
  {
    key: 'projects.eyebrow_default',
    default: '// SELECTED WORK',
    label: 'Default Projects Eyebrow',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.title_default',
    default: 'What I built.',
    label: 'Default Projects Heading',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.subtitle_default',
    default: 'Production bots, monitoring dashboards, and automation toolkits.',
    label: 'Default Projects Subtitle',
    group: 'Work & Case Studies',
    multiline: true,
  },
  {
    key: 'projects.filter_aria',
    default: 'Filter projects by category',
    label: 'Category Filter Group Aria Label',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.filter_all',
    default: 'All Projects',
    label: 'All Projects Filter Button Text',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.archive_cta',
    default: 'Explore all projects & case studies in archive',
    label: 'View Work Archive Button Label',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.featured_badge',
    default: 'Featured',
    label: 'Project Card Featured Pill',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.case_study_link',
    default: 'Case study',
    label: 'Project Card Case Study Link',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.live_demo_link',
    default: 'Live demo',
    label: 'Project Card Live Demo Link',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.explore_link',
    default: 'Explore',
    label: 'Project Card Explore Link',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.github_link',
    default: 'GitHub',
    label: 'Project Card GitHub Link',
    group: 'Work & Case Studies',
  },
  {
    key: 'projects.github_aria',
    default: 'View project source on GitHub',
    label: 'Project Card GitHub Aria Label',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.archive_eyebrow',
    default: '// SELECTED WORK & ARCHIVE',
    label: 'Work Archive Page Eyebrow',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.archive_title',
    default: 'Engineering projects & case studies.',
    label: 'Work Archive Page Heading',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.archive_subtitle',
    default: 'A complete catalog of automation bots, telemetry dashboards, and cloud workflows built for real production environments.',
    label: 'Work Archive Page Subtitle',
    group: 'Work & Case Studies',
    multiline: true,
  },
  {
    key: 'work.empty_state',
    default: 'No published projects found currently. Check back soon!',
    label: 'Work Archive Empty State Message',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.footer_cta',
    default: 'Start a project inquiry →',
    label: 'Work Archive Footer CTA Link',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_all_work',
    default: 'All Work',
    label: 'Case Study Header Back Link',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_discuss_btn',
    default: 'Discuss Build',
    label: 'Case Study Header CTA Button',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_featured_pill',
    default: 'Featured Project',
    label: 'Case Study Hero Featured Pill',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_live_demo_btn',
    default: 'Live Demo',
    label: 'Case Study Hero Live Demo Button',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_explore_btn',
    default: 'Explore Project',
    label: 'Case Study Hero Explore Button',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_github_btn',
    default: 'GitHub Repository',
    label: 'Case Study Hero GitHub Button',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_stack_label',
    default: 'Stack & Technologies:',
    label: 'Case Study Tech Stack Label',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_prob_badge',
    default: '// 01. THE PROBLEM',
    label: 'Case Study Problem Section Eyebrow',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_prob_heading',
    default: 'The Challenge & Scope',
    label: 'Case Study Problem Section Heading',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_prob_fallback',
    default: 'Operational bottlenecks often occur when systems require manual synchronization across distributed APIs or disconnected hardware endpoints. The objective was to design a scalable, autonomous workflow that operates reliably without requiring constant human intervention.',
    label: 'Case Study Problem Fallback Text',
    group: 'Work & Case Studies',
    multiline: true,
  },
  {
    key: 'work.detail_sol_badge',
    default: '// 02. ARCHITECTURE',
    label: 'Case Study Solution Section Eyebrow',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_sol_heading',
    default: 'Engineering & Technical Solution',
    label: 'Case Study Solution Section Heading',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_sol_fallback',
    default: 'Engineered an asynchronous architecture using modular event hooks and strict typing. Implemented robust error retry handling, telemetry status logging, and secure edge data persistence to deliver deterministic execution under varying network loads.',
    label: 'Case Study Solution Fallback Text',
    group: 'Work & Case Studies',
    multiline: true,
  },
  {
    key: 'work.detail_res_badge',
    default: '// 03. OUTCOME',
    label: 'Case Study Outcome Section Eyebrow',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_res_heading',
    default: 'Results & Key Takeaways',
    label: 'Case Study Outcome Section Heading',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_res_fallback',
    default: 'Delivered a reliable, automated pipeline that operates continuously with minimal maintenance overhead. Validated through production testing and documented for straightforward extensibility.',
    label: 'Case Study Outcome Fallback Text',
    group: 'Work & Case Studies',
    multiline: true,
  },
  {
    key: 'work.detail_cta_title',
    default: 'Interested in building something similar?',
    label: 'Case Study Bottom CTA Title',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_cta_desc',
    default: "Whether you need a custom automation bot, full-stack monitoring system, or backend integration, I'm available for engineering collaborations.",
    label: 'Case Study Bottom CTA Description',
    group: 'Work & Case Studies',
    multiline: true,
  },
  {
    key: 'work.detail_cta_btn',
    default: 'Start a Project Discussion',
    label: 'Case Study Bottom CTA Button',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_related_title',
    default: 'More Selected Projects',
    label: 'Case Study Related Projects Heading',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_read_case_study',
    default: 'Read case study →',
    label: 'Related Project Card CTA Text',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.detail_back_work',
    default: 'Back to all work ↑',
    label: 'Case Study Footer Back Link',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.not_found_eyebrow',
    default: '// 404 ERROR',
    label: 'Project Not Found Eyebrow',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.not_found_title',
    default: 'Project Not Found',
    label: 'Project Not Found Title',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.not_found_desc',
    default: "The requested project case study doesn't exist or is currently unpublished.",
    label: 'Project Not Found Description',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.not_found_all_btn',
    default: 'View All Work',
    label: 'Project Not Found Primary Button',
    group: 'Work & Case Studies',
  },
  {
    key: 'work.not_found_home_btn',
    default: 'Return Home',
    label: 'Project Not Found Secondary Button',
    group: 'Work & Case Studies',
  },

  // ── Group 9: Proof & Testimonials Section ───────────────────────────────
  {
    key: 'proof.eyebrow_default',
    default: '// TESTIMONIALS',
    label: 'Default Proof Section Eyebrow',
    group: 'Proof & Testimonials',
  },
  {
    key: 'proof.title_default',
    default: 'Proof & context',
    label: 'Default Proof Section Heading',
    group: 'Proof & Testimonials',
  },
  {
    key: 'proof.subtitle_default',
    default: 'Organizations and environments that shaped my work.',
    label: 'Default Proof Section Subtitle',
    group: 'Proof & Testimonials',
    multiline: true,
  },
  {
    key: 'proof.orgs_heading_default',
    default: "Who I've worked with",
    label: 'Default Organizations Subheading',
    group: 'Proof & Testimonials',
  },
  {
    key: 'proof.testimonials_heading_default',
    default: 'What people say',
    label: 'Default Testimonials Subheading',
    group: 'Proof & Testimonials',
  },
  {
    key: 'proof.rating_aria_prefix',
    default: 'Rated out of 5 stars:',
    label: 'Testimonial Star Rating Aria Prefix',
    group: 'Proof & Testimonials',
  },

  // ── Group 10: Contact Section & Form ────────────────────────────────────
  {
    key: 'contact.eyebrow_default',
    default: "// LET'S CONNECT",
    label: 'Default Contact Eyebrow',
    group: 'Contact & Form',
  },
  {
    key: 'contact.title_default',
    default: 'Get in touch.',
    label: 'Default Contact Heading',
    group: 'Contact & Form',
  },
  {
    key: 'contact.subtitle_default',
    default: "Tell me what you're working on. Open to automation workflows, backend architecture, and custom bots.",
    label: 'Default Contact Subtitle',
    group: 'Contact & Form',
    multiline: true,
  },
  {
    key: 'contact.intro_default',
    default: 'Reach out directly for automation projects, freelance builds, or technical collaborations.',
    label: 'Default Contact Channels Intro Text',
    group: 'Contact & Form',
    multiline: true,
  },
  {
    key: 'contact.channel_email_label',
    default: 'Email',
    label: 'Contact Channel Email Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.channel_linkedin_label',
    default: 'LinkedIn',
    label: 'Contact Channel LinkedIn Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.channel_github_label',
    default: 'GitHub',
    label: 'Contact Channel GitHub Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.channel_website_label',
    default: 'Website',
    label: 'Contact Channel Main Website Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.channel_resume_label',
    default: 'Resume',
    label: 'Contact Channel Resume Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.channel_resume_default',
    default: 'Download CV',
    label: 'Contact Channel Resume Default Value',
    group: 'Contact & Form',
  },
  {
    key: 'contact.form_aria',
    default: 'Direct message form',
    label: 'Contact Form Aria Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.honeypot_label',
    default: 'Leave this field blank',
    label: 'Contact Form Honeypot Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_name_label',
    default: 'Name',
    label: 'Name Field Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_name_placeholder',
    default: 'Your name',
    label: 'Name Field Placeholder',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_email_label',
    default: 'Email',
    label: 'Email Field Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_email_placeholder',
    default: 'you@domain.com',
    label: 'Email Field Placeholder',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_subject_label',
    default: 'Subject',
    label: 'Subject Field Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_subject_placeholder',
    default: 'Bot build, workflow automation, inquiry...',
    label: 'Subject Field Placeholder',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_message_label',
    default: 'Message',
    label: 'Message Field Label',
    group: 'Contact & Form',
  },
  {
    key: 'contact.field_message_placeholder',
    default: 'Briefly describe your systems, workflow requirements, or project scope...',
    label: 'Message Field Placeholder',
    group: 'Contact & Form',
  },
  {
    key: 'contact.submit_btn',
    default: 'Send Message',
    label: 'Submit Button Text',
    group: 'Contact & Form',
  },
  {
    key: 'contact.sending_btn',
    default: 'Sending...',
    label: 'Submit Button Sending State Text',
    group: 'Contact & Form',
  },
  {
    key: 'contact.msg_required_err',
    default: 'Please fill in all required fields.',
    label: 'Validation Required Fields Error',
    group: 'Contact & Form',
  },
  {
    key: 'contact.msg_success',
    default: "Message sent! I'll get back to you soon.",
    label: 'Submission Success Message',
    group: 'Contact & Form',
  },
  {
    key: 'contact.msg_error',
    default: 'Something went wrong. Please try again.',
    label: 'Submission Generic Error Message',
    group: 'Contact & Form',
  },
  {
    key: 'contact.msg_network_err',
    default: 'Network error. Please try again.',
    label: 'Submission Network Error Message',
    group: 'Contact & Form',
  },
  {
    key: 'contact.form_disabled_text',
    default: 'The web message form is currently unavailable. Please send an email directly to',
    label: 'Disabled Form Notice Prefix',
    group: 'Contact & Form',
    multiline: true,
  },

  // ── Group 11: Footer, 404, Offline & PWA Prompts ────────────────────────
  {
    key: 'footer.links_aria',
    default: 'Footer links',
    label: 'Footer Navigation Aria Label',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'footer.main_site_label',
    default: 'Main Site',
    label: 'Footer Main Site Link Label',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'footer.github_label',
    default: 'GitHub',
    label: 'Footer GitHub Link Label',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'footer.linkedin_label',
    default: 'LinkedIn',
    label: 'Footer LinkedIn Link Label',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'footer.subcopy',
    default: 'All rights reserved',
    label: 'Footer Sub-Copyright Text',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'error404.code',
    default: '404',
    label: '404 Page Watermark Code',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'error404.eyebrow',
    default: '// ERROR_404',
    label: '404 Page Eyebrow',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'error404.title',
    default: 'Page not found',
    label: '404 Page Title',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'error404.description',
    default: "The route you requested doesn't exist. You may have followed an outdated link or typed the address incorrectly.",
    label: '404 Page Description',
    group: 'Footer, 404 & PWA',
    multiline: true,
  },
  {
    key: 'error404.back_home_btn',
    default: 'Back to Portfolio',
    label: '404 Primary Button Text',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'error404.go_back_btn',
    default: 'Go Back',
    label: '404 Secondary Button Text',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'offline.eyebrow',
    default: '// Offline Mode',
    label: 'Offline Page Eyebrow',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'offline.title',
    default: 'Connection Lost',
    label: 'Offline Page Heading',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'offline.description',
    default: 'It looks like your internet connection is currently unavailable. Cached pages and resources remain accessible.',
    label: 'Offline Page Description',
    group: 'Footer, 404 & PWA',
    multiline: true,
  },
  {
    key: 'offline.retry_btn',
    default: 'Retry Connection',
    label: 'Offline Page Retry Button',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'offline.home_btn',
    default: 'Return Home',
    label: 'Offline Page Return Home Button',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.update_available',
    default: 'A new version is available.',
    label: 'PWA Update Toast Message',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.refresh_btn',
    default: 'Refresh',
    label: 'PWA Update Toast Refresh Button',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.install_title',
    default: 'Install Portfolio App',
    label: 'PWA Install Banner Title',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.install_desc',
    default: 'Install on your home screen for quick offline access',
    label: 'PWA Install Banner Description',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.install_btn',
    default: 'Install',
    label: 'PWA Install Banner Action Button',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.dismiss_aria',
    default: 'Dismiss',
    label: 'PWA Banner Dismiss Button Aria Label',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.ios_title',
    default: 'Add to Home Screen',
    label: 'iOS Install Hint Title',
    group: 'Footer, 404 & PWA',
  },
  {
    key: 'pwa.ios_desc',
    default: "Tap Share then 'Add to Home Screen' for full offline app experience.",
    label: 'iOS Install Hint Description',
    group: 'Footer, 404 & PWA',
  },
];

export const UI_STRINGS_MAP: Map<string, UiStringItem> = new Map(
  UI_STRINGS.map((item) => [item.key, item])
);

export const DEFAULT_UI_MAP: Record<string, string> = Object.fromEntries(
  UI_STRINGS.map((item) => [item.key, item.default])
);

/**
 * Resolves an interface text string by key from settings.ui (falling back to registry default).
 * Escapes HTML tags by default; when allowHtml is set on the registry entry, allows only
 * <strong>, <em>, and <br> through sanitizeBasicHtml.
 */
export function t(settingsOrUi: Record<string, any> | undefined, key: string): string {
  const def = UI_STRINGS_MAP.get(key);
  let uiMap: Record<string, any> = {};
  if (settingsOrUi && typeof settingsOrUi === 'object') {
    if ('ui' in settingsOrUi && settingsOrUi.ui && typeof settingsOrUi.ui === 'object') {
      uiMap = settingsOrUi.ui;
    } else if (!('global' in settingsOrUi) && !('hero' in settingsOrUi)) {
      uiMap = settingsOrUi;
    }
  }
  const stored = uiMap?.[key];
  const raw = typeof stored === 'string' && stored.trim() !== '' ? stored : (def?.default ?? '');
  if (def?.allowHtml) {
    return sanitizeBasicHtml(raw);
  }
  // Strip any raw angle brackets for plain-text strings so they remain safe in attributes and text nodes
  return String(raw).replace(/[<>]/g, '');
}
