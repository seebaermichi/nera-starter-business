# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-18

### Added

-   First release: the `business` starter for `nera new --starter business`. Requires `@nera-static/nera` 1.11.0 or later. A small-business site on `@nera-static/theme-business` with one small script for the contact form and no third-party requests; a scaffolded site passes `nera build --check` and `nera validate` with no findings, also with every check rule promoted to error and with `--lang de`.
-   Dependencies merged into the site: `@nera-static/theme-business` ^1.0.1 and the plugins `plugin-contact-form` ^1.1.1, `plugin-images` ^1.0.2, `plugin-navigation` ^3.1.1, `plugin-social-media-links` ^2.3.0 and `plugin-sitemap` ^1.1.0.
-   `config/app.yaml`: `lang`, `name`, `robots`, `theme: business`, `origin: https://example.com` with a comment to replace it before deploying (the sitemap needs it), the business's facts under `business:` (address, phone, opening hours, a holiday note; no `email`, the contact form takes its place) marked as placeholders, and `translations.en` with `language_name` and every theme, footer-link, opening-hours and plugin text, so `--lang` copies them into a new entry to translate.
-   `config/theme.yaml` (`footer_links` to the imprint and privacy pages), `contact-form.yaml` (name, email, message and a privacy checkbox, every text a translation key, a placeholder recipient), `navigation.yaml`, `images.yaml` and `social-media-links.yaml` (no `target="_blank"`, one placeholder link).
-   `theme/views/partials/`: the theme's seams filled with the plugins' output: `hero-media`, `card-media`, `contact-form`, `nav-main` and `footer-extra`.
-   `theme/views/vendor/`: the published templates of plugin-contact-form, plugin-images, plugin-navigation and plugin-social-media-links (without `fontawesome-cdn-link.pug`, which loads a CDN), unchanged.
-   `theme/assets/js/contact-form.js`: the client script plugin-contact-form 1.1.1 publishes; it opens the visitor's own mail program, nothing is sent by the site.
-   `pages/index.md` (home with the hero and three service cards), `about.md`, `services.md`, `opening-hours.md` and `contact.md` (the form, the address and the opening hours); `theme/assets/images/hero.jpg` for the hero.
-   `pages/imprint.md` and `pages/privacy.md`: clearly marked placeholders citing § 5 DDG and the TDDDG, to be replaced by the site owner's own legal texts.
