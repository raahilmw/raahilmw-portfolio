# raahilmw.com audit remediation

Verified on 28 November 2026. The public site uses GitHub Pages and Rumahweb authoritative DNS.

| Finding | Result |
| --- | --- |
| 1 | DNS records prepared in raahilmw.com.records. Publication requires Rumahweb DNS access. The owner confirmed that email uses Gmail and the domain sends and receives no email. |
| 2 | HTTPS www redirects successfully to https://raahilmw.com/. The bare raahilmw.github.io 404 does not prevent that redirect. |
| 3 | The historical résumé PDF is retrievable. The owner explicitly chose to keep all personal data public. History remains accessible. |
| 4 | Builds default to https://raahilmw.com and synchronize dist and docs. GitHub Actions rebuilds and checks the artifact before publication. Both directories remain tracked because Sites publishes dist and GitHub Pages publishes docs. |
| 5 | CAA prepared for Let's Encrypt, the CA used by GitHub Pages. DNSSEC requires signing the authoritative zone and registering its actual DS at the registrar. |
| 6 | Anti-framing response headers prepared in response-headers.txt. GitHub Pages cannot apply custom response headers from the repository. |
| 7 | Every generated HTML page includes an enforcing CSP meta element before scripts. Inline scripts require generated SHA-384 hashes, event handlers are blocked, and object, frame, base and form sources are restricted. Style attributes remain available for the existing animations and tile positions. |
| 8 | Every external script tag has SHA-384 integrity and crossorigin attributes generated from its local file. |
| 9 | Unreferenced three.module.min.js and scrollcraft.js removed from both published directories. |
| 10 | The Pages wildcard CORS header remains provider-controlled. Public static responses contain no authenticated private data. This header alone demonstrates public readability, without credentialed cross-origin access. |
| 11 | The owner chose to retain the Discord link and public platform handles. |

## Rumahweb DNS changes

Open the existing domain's DNS management and add the four records from raahilmw.com.records. For Null MX, use priority 0 and destination dot. Preserve the four GitHub Pages A records and the existing www CNAME. The records file is an additive set, not a replacement zone.

If the current Rumahweb nameservers support DNSSEC signing, enable signing there first and register the returned DS through the registrar. If signing is unavailable on the current DNS plan, ask Rumahweb to enable it or choose a signing-capable DNS service. A DS must match the live zone's DNSKEY.

CAA limits certificate authorities accepted by issuers. DNSSEC authenticates DNS responses. Neither substitutes for application access controls.

## HTTP response headers

Apply response-headers.txt at a reverse proxy or a host that supports custom HTTP response headers. Keep the generated CSP meta policy as well. A separate frame-ancestors policy combines with the document policy.

The frame-ancestors directive requires an HTTP response header. X-Frame-Options also requires an HTTP response header. Putting either directive in HTML would leave clickjacking protection ineffective.

The domain's DNS access is unavailable in this Cloud environment, so these infrastructure changes are pending. A DNS or hosting migration needs an agreed target before changing production routing.

## Verification

Run python scripts/build.py, python scripts/check-security.py and node scripts/check-navigation.cjs. The build needs only Python's standard library.

After DNS publication, query TXT at the apex and _dmarc, MX and CAA at the apex, and DS/DNSKEY with a validating resolver. DNSSEC completion requires a valid DS-to-DNSKEY chain.

After adding an HTTP proxy or changing hosting, verify the actual response headers on all eight HTML routes, error pages and www. Test framing from a separate origin. A CSP meta element does not complete finding 6.

Removing a PDF from Git history would require an explicit history rewrite and coordination with existing clones, plus a GitHub Support request for retained references when applicable. Local deletion cannot remove copies already downloaded.

## Sources

- https://www.rumahweb.com/journal/cara-setting-dns-domain-rumahweb/
- https://www.rumahweb.com/journal/apa-itu-dnssec-adalah/
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
