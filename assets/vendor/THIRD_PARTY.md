# Third-party browser libraries

These files are vendored locally so the chat renderer does not depend on a CDN at runtime.

| Library | Version | License | Source |
| --- | --- | --- | --- |
| marked | 12.0.2 | MIT | https://github.com/markedjs/marked |
| DOMPurify | 3.1.6 | Apache-2.0 OR MPL-2.0 | https://github.com/cure53/DOMPurify |
| KaTeX | 0.16.11 | MIT | https://github.com/KaTeX/KaTeX |

KaTeX's `katex.min.css` references the font files under `katex/fonts/`; those are part of the same distribution.
