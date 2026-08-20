# Live Response Header Findings

Read-only `curl -I` probes were run against the live deployment on 2026-08-20.

| Route | Status | Cache policy | Key observed headers |
|---|---:|---|---|
| `/` | 200 | `public,max-age=60,stale-while-revalidate=300` | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| `/admin` | 200 | `no-store` | Same security headers plus `X-Robots-Tag: noindex,nofollow` |
| `/docs` | 200 | `no-store` | Same baseline security headers; no `X-Robots-Tag` observed in the header probe |
| `/health` | 200 | not explicitly set | Same baseline security headers |
| `/robots.txt` | 200 | `public,max-age=86400` | Content type `text/plain` |
| `/sitemap.xml` | 200 | `public,max-age=3600` | Content type `application/xml` |

The application-level baseline security headers are working on the observed routes. No `Strict-Transport-Security` or `Content-Security-Policy` header was observed in these probes. HSTS may be managed at the zone level, but it was not evidenced by this Worker response; CSP should be evaluated carefully because the current pages use inline scripts and styles.

The public homepage is intentionally cached for 60 seconds, while the admin page and docs are no-store. This matches the source response helpers but means public content changes may remain visible for up to the configured cache period.
