# @nera-static/starter-business

[![Test](https://github.com/seebaermichi/nera-starter-business/actions/workflows/test.yml/badge.svg)](https://github.com/seebaermichi/nera-starter-business/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/starter-business)](https://www.npmjs.com/package/@nera-static/starter-business)

📖 **Documentation:** [nera.js.org](https://nera.js.org)

A ready-to-edit site for a small business, built with the
[Nera](https://github.com/seebaermichi/nera) static site generator on
[`@nera-static/theme-business`](https://www.npmjs.com/package/@nera-static/theme-business):
home with a hero image and service cards, about, services, opening hours, a
contact form, navigation, responsive images, social links, a sitemap,
schema.org structured data and imprint and privacy placeholders. One small
script for the contact form, no third-party requests; a fresh site passes `nera build --check` and
`nera validate` without a single finding.

## Usage

```bash
npx @nera-static/nera new my-site --starter business
npx @nera-static/nera new my-site --starter business --name "My Bakery" --lang de
```

`--name` and `--lang` set `name` and `lang` in `config/app.yaml`; a new
language gets a copy of the English `translations:` entry to translate.

## What you get

- `pages/index.md` (home), `about.md`, `services.md`, `opening-hours.md`,
  `contact.md` (with the form)
- `pages/imprint.md`, `pages/privacy.md`: **placeholders, not legal texts**
- `config/app.yaml`: name, language, `theme: business`, `origin`, the
  business's facts (`business:` address, phone, opening hours) and the theme
  and plugin texts
- `config/theme.yaml`, `contact-form.yaml`, `navigation.yaml`, `images.yaml`,
  `social-media-links.yaml`
- `config/structured-data.yaml`: the business as a schema.org `LocalBusiness`,
  written as JSON-LD into the `<head>` of every page; `config/plugin-order.yaml`
  runs that plugin last
- `theme/views/partials/`: the theme's seams, filled with the plugins' output
- `theme/views/vendor/`: the plugins' published templates
- `theme/assets/js/contact-form.js`: the contact form's script, which opens
  the visitor's own mail program (the form has no backend)
- `theme/assets/images/hero.jpg`: the home page's hero image
- plugins: contact-form, images, navigation, social-media-links, sitemap,
  structured-data

## German texts for `--lang de`

Replace the copied `de:` entry in `config/app.yaml` with:

```yaml
    de:
        language_name: Deutsch
        Skip to content: Zum Inhalt springen
        Main navigation: Hauptnavigation
        Language: Sprache
        Legal: Rechtliches
        Opening hours: Öffnungszeiten
        Closed: Geschlossen
        Contact details: Kontakt
        Phone: Telefon
        Email: E-Mail
        Imprint: Impressum
        Privacy: Datenschutz
        Mon–Fri: Mo–Fr
        Sat: Sa
        Sun: So
        Closed on public holidays.: An Feiertagen geschlossen.
        Navigation: Navigation
        Message from the website: Nachricht über die Website
        Send message: Nachricht senden
        Please fill in all required fields.: Bitte füllen Sie alle Pflichtfelder aus.
        Please enter a valid email address.: Bitte geben Sie eine gültige E-Mail-Adresse an.
        'Yes': Ja
        'No': Nein
        Your name: Ihr Name
        Your email: Ihre E-Mail-Adresse
        Message: Nachricht
        I have read the privacy notice: Ich habe die Datenschutzerklärung gelesen
        contact_intro: Wir antworten innerhalb eines Werktags. In dringenden Fällen rufen Sie uns bitte an.
        contact_consent: 'Beim Senden öffnet sich Ihr eigenes E-Mail-Programm; diese Website versendet nichts. Mehr dazu in der <a href="/privacy.html">Datenschutzerklärung</a>.'
```

## Requirements

- `@nera-static/nera` 1.11.0 or later, with `@nera-static/core` 4.15.0 or
  later (the theme's floor; a fresh install brings the newest)
- Node.js `>=22.12.0` (its bundled npm 10.9 or later)

## License

MIT

## First steps

After `nera new` the files are yours: a starter has no update path. Each
file named in steps 1 to 6 marks its placeholders as such.

1. Replace `origin: https://example.com` in `config/app.yaml` with your
   site's real address. The sitemap and the structured data's URLs are
   built from it.
2. Replace the business's facts under `business:` in `config/app.yaml`:
   street, postal code, city, country, phone and opening hours. A row's
   `days` and the `hours_note` are translation keys: add new ones to
   `translations:`.
3. Replace the same facts in `config/structured-data.yaml`, which does not
   read `business:`: `type` (`LocalBusiness` or a subtype such as `Bakery`),
   `name` (which `nera new --name` does not set), `address`, `telephone`,
   `opening_hours`, `image` and `priceRange`.
   Keep them in step with `business:`, so the page and its structured data
   say the same.
4. Replace `recipient: hello@example.com` in `config/contact-form.yaml` with
   the address the contact form writes to.
5. Replace the social link in `config/social-media-links.yaml`.
6. Replace `pages/imprint.md` and `pages/privacy.md` with your own legal texts.
7. Replace the sample copy of the pages, `theme/assets/images/hero.jpg` and
   the grey placeholder icon `theme/assets/favicon.ico` with your own.
