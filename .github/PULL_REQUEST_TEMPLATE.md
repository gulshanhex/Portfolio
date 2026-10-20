## Summary

<!-- Briefly describe the changes introduced in this pull request -->

## Related Issue

<!-- Link any related issue, e.g., Closes #12 -->

## Verification Checklist

- [ ] `npm run check` passes (`check-admin.mjs`, `check-settings-usage.mjs`, `check-hardcoded-strings.mjs`, `check-assets.mjs`).
- [ ] `npm run build` succeeds with zero errors.
- [ ] All new public strings are registered in `src/lib/ui-strings.ts` and read via `t(settings, key)`.
- [ ] `src/pages/admin/index.astro` retains `<script is:inline>` without `define:vars` and declares all `onclick="..."` functions at top level.
- [ ] Protected files (`package-lock.json`, `public/fonts/*`, `public/.assetsignore`) were not modified or deleted.
- [ ] Light and dark modes maintain WCAG AA contrast across all 4 accent presets.
