// ── SEO, GEO, AEO, OpenGraph & Rich JSON-LD Structured Data Engine ──────
// Builds a comprehensive Schema.org @graph (Person, ProfilePage, WebSite,
// ItemList of Projects, OfferCatalog of Services, FAQPage, BreadcrumbList,
// and SpeakableSpecification) plus GEO/AEO metadata.

import { stripHtml } from './db';

export function buildJsonLdGraph(data: {
  settings: Record<string, any>;
  skills: any[];
  services: any[];
  experiences: any[];
  education: any[];
  projects: any[];
  proof: any[];
  faqs: any[];
}) {
  const { settings, skills, services, experiences, education, projects, proof, faqs } = data;
  const g = settings.global || {};
  const seo = settings.seo || {};
  const contact = settings.contact || {};
  const about = settings.about || {};

  const canonical = (seo.canonical || g.portfolio || 'https://portfolio.example.com').replace(/\/$/, '');
  const mainDomain = (contact.main_site || g.domain || 'https://example.com').replace(/\/$/, '');
  const name = g.name || 'Your Name';
  const tagline = g.tagline || 'Automation & AI Systems Engineer';
  const location = g.location || 'Remote';
  const ogImage = seo.og_image || `${canonical}/og-image.png`;
  const description =
    seo.description ||
    `Official portfolio of ${name} — ${tagline} (${location}), specializing in Python, Bot Development, PLC Industrial Automation, and Cloud Systems.`;

  // Collect all skill names for knowsAbout
  const knowsAbout: string[] = [];
  for (const group of skills || []) {
    if (group.label) knowsAbout.push(group.label);
    for (const pill of group.pills || []) {
      if (pill.label && !knowsAbout.includes(pill.label)) {
        knowsAbout.push(pill.label);
      }
    }
  }

  // SameAs social & identity URLs
  const sameAs = [contact.github, contact.linkedin, mainDomain, canonical].filter(Boolean);

  // Alumni / Educational organizations
  const alumniOf = (education || []).map((ed) => ({
    '@type': 'EducationalOrganization',
    name: ed.school,
    description: `${ed.degree} — ${ed.stream} (${ed.period})`,
  }));

  // Work / Internship organizations
  const worksFor = (experiences || []).map((xp) => ({
    '@type': 'Organization',
    name: xp.company,
    description: `${xp.title} (${xp.date_range})`,
    location: xp.location,
  }));

  // Testimonials as Reviews
  const testimonials = (proof || []).filter((p) => p.type === 'testimonial' && p.testimonial_text);

  // 1. Person Entity
  const personEntity: Record<string, any> = {
    '@type': 'Person',
    '@id': `${canonical}/#person`,
    name,
    givenName: name.split(' ')[0] || name,
    familyName: name.split(' ').slice(1).join(' ') || '',
    jobTitle: tagline,
    description:
      (about.paragraphs || []).map((p: string) => stripHtml(p)).join(' ') || description,
    url: canonical,
    mainEntityOfPage: `${canonical}/#profilepage`,
    image: {
      '@type': 'ImageObject',
      '@id': `${canonical}/#ogimage`,
      url: ogImage,
      width: 1200,
      height: 630,
      caption: `${name} — ${tagline}`,
    },
    ...(contact.email ? { email: `mailto:${contact.email}` } : {}),
    sameAs,
    knowsAbout,
    knowsLanguage: ['en'],
    ...(alumniOf.length ? { alumniOf } : {}),
    ...(worksFor.length ? { affiliation: worksFor } : {}),
    hasOccupation: {
      '@type': 'Occupation',
      name: tagline,
      occupationLocation: {
        '@type': 'City',
        name: location,
      },
      skills: knowsAbout.slice(0, 20).join(', '),
    },
  };

  // 2. WebSite Entity
  const websiteEntity = {
    '@type': 'WebSite',
    '@id': `${canonical}/#website`,
    url: canonical,
    name: g.site_name || `${name} Portfolio`,
    description,
    inLanguage: 'en-US',
    publisher: {
      '@id': `${canonical}/#person`,
    },
  };

  // 3. ProfilePage Entity with AEO SpeakableSpecification
  const profilePageEntity: Record<string, any> = {
    '@type': 'ProfilePage',
    '@id': `${canonical}/#profilepage`,
    url: canonical,
    name: seo.title || `${name} — ${tagline}`,
    description,
    isPartOf: {
      '@id': `${canonical}/#website`,
    },
    about: {
      '@id': `${canonical}/#person`,
    },
    mainEntity: {
      '@id': `${canonical}/#person`,
    },
    inLanguage: 'en-US',
    dateModified: new Date().toISOString(),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#hero .hero-headline', '#hero .hero-subheadline', '#about .about-narrative', '#faq .faq-item-details'],
    },
    ...(Boolean(seo.reviews_jsonld) && testimonials.length
      ? {
          review: testimonials.map((t) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: t.name,
              jobTitle: t.subtitle,
            },
            reviewBody: stripHtml(t.testimonial_text),
            reviewRating: {
              '@type': 'Rating',
              ratingValue: t.testimonial_rating || 5,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
  };

  // 4. ItemList of Projects (CreativeWork / SoftwareSourceCode)
  const projectsListEntity = {
    '@type': 'ItemList',
    '@id': `${canonical}/#projects-list`,
    name: `Selected Engineering & Automation Projects by ${name}`,
    numberOfItems: (projects || []).length,
    itemListElement: (projects || []).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'SoftwareSourceCode',
        name: p.title,
        description: stripHtml(p.summary),
        programmingLanguage: p.stack || [],
        keywords: [...(p.tags || []), ...(p.stack || [])].join(', '),
        author: { '@id': `${canonical}/#person` },
        ...(p.github_url ? { codeRepository: p.github_url } : {}),
        ...(p.demo_url || p.external_url ? { url: p.demo_url || p.external_url } : { url: `${canonical}/#projects` }),
      },
    })),
  };

  // 5. OfferCatalog of Engineering Services
  const servicesCatalogEntity = {
    '@type': 'Service',
    '@id': `${canonical}/#services-catalog`,
    name: `Automation, Backend & Cloud Engineering Services by ${name}`,
    provider: { '@id': `${canonical}/#person` },
    areaServed: ['Worldwide'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Engineering & Automation Services',
      itemListElement: (services || []).map((s, idx) => ({
        '@type': 'Offer',
        position: idx + 1,
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: stripHtml(s.description),
        },
      })),
    },
  };

  // 6. FAQPage Entity (AEO / Answer Engine Optimization)
  const faqItems = faqs && faqs.length > 0 ? faqs : [];
  const faqPageEntity =
    faqItems.length > 0
      ? {
          '@type': 'FAQPage',
          '@id': `${canonical}/#faqpage`,
          mainEntity: faqItems.map((fq) => ({
            '@type': 'Question',
            name: fq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: stripHtml(fq.answer),
            },
          })),
        }
      : null;

  // 7. BreadcrumbList
  const breadcrumbEntity = {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}/#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: canonical,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Work',
        item: `${canonical}/#projects`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Contact',
        item: `${canonical}/#contact`,
      },
    ],
  };

  const graph: any[] = [
    websiteEntity,
    personEntity,
    profilePageEntity,
    projectsListEntity,
    servicesCatalogEntity,
    breadcrumbEntity,
  ];
  if (faqPageEntity) graph.push(faqPageEntity);

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
