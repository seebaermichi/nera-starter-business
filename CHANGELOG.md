# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-22

### Added

-   Schema.org structured data: a scaffolded site depends on `@nera-static/plugin-structured-data` ^1.0.1 and writes one JSON-LD block into the `<head>` of every page, describing the business as a `LocalBusiness` (name, address, phone, opening hours, image, price range) and the site as a `WebSite` in the site's language. `nera build --check` and `nera validate` stay without findings, also with every check rule promoted to error and with `--lang de`.
-   `config/structured-data.yaml`: the business's placeholder facts, the same as under `business:` in `config/app.yaml`, which the plugin does not read; `config/plugin-order.yaml` runs the plugin last, as its README asks.
-   `theme/views/partials/head-extra.pug` fills the theme's `head-extra` seam with the plugin's view; `theme/views/vendor/plugin-structured-data/` is its published template, unchanged.
-   README: a First steps item naming the values of `config/structured-data.yaml` to replace and keep in step with `business:`.

### Changed

-   The package and starter description mention the structured data.

## [1.0.1] - 2026-10-18

### Changed

-   A scaffolded site now depends on `@nera-static/theme-business` ^1.0.2 (was ^1.0.1), the version the starter's tests run on.

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
-   `theme/assets/favicon.ico`: a small grey placeholder icon, built to `public/favicon.ico` so a browser's default request finds a file; the README's First steps say to replace it.
-   `pages/imprint.md` and `pages/privacy.md`: clearly marked placeholders citing § 5 DDG and the TDDDG, to be replaced by the site owner's own legal texts.
