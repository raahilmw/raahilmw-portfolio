---
name: modern-web-guidance
description: Consult GoogleChrome’s modern web platform guides when maintaining browser interactions, CSS layouts and accessibility in this portfolio.
---

Use the published Modern Web Guidance CLI with Node.js 22 or newer. Run it from the repository root.

```sh
DISABLE_TELEMETRY=1 npx -y modern-web-guidance@1.0.2 search "dismiss modal dialog"
DISABLE_TELEMETRY=1 npx -y modern-web-guidance@1.0.2 retrieve light-dismiss-a-dialog
DISABLE_TELEMETRY=1 npx -y modern-web-guidance@1.0.2 legacy-scan dist --json
```

Choose a search query and guide matching the feature under review. Check scanner suggestions against the scripts actually loaded by the eight generated routes. Edit the source template or shared asset, regenerate both published outputs, and exercise the native and fallback behavior.

[Upstream project](https://github.com/GoogleChrome/modern-web-guidance-src)
