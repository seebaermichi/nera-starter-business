import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'yaml'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))

// The theme and the plugins a scaffolded site gets (ROADMAP-ai.md L5, plan D3).
const DEPENDENCIES = [
    '@nera-static/plugin-contact-form',
    '@nera-static/plugin-images',
    '@nera-static/plugin-navigation',
    '@nera-static/plugin-sitemap',
    '@nera-static/plugin-social-media-links',
    '@nera-static/theme-business',
]

describe('package.json starter contract', () => {
    it('names the starter with a label and a description', () => {
        expect(pkg.nera.starter.label).toBe('Business')
        expect(pkg.nera.starter.description.trim()).not.toBe('')
        // The `nera new` picker shows the npm description, so both say the same.
        expect(pkg.description).toBe(pkg.nera.starter.description)
    })

    it('is found by the starter search', () => {
        expect(pkg.keywords).toEqual(['nera', 'nera-starter', 'static-site-generator', 'starter', 'business'])
    })

    it('depends on the business theme and its five plugins, with caret ranges', () => {
        expect(Object.keys(pkg.dependencies).sort()).toEqual(DEPENDENCIES)
        for (const range of Object.values(pkg.dependencies)) expect(range).toMatch(/^\^\d+\.\d+\.\d+$/)
        expect(pkg.peerDependencies).toBeUndefined()
        expect(pkg.optionalDependencies).toBeUndefined()
    })

    it('uses theme-business 1.x (the seams and app.business of ROADMAP-themes.md §S3)', () => {
        expect(pkg.dependencies['@nera-static/theme-business']).toMatch(/^\^1\./)
    })

    it('uses plugin-contact-form 1.1.1 or later (it publishes the client script)', () => {
        const [major, minor, patch] = pkg.dependencies['@nera-static/plugin-contact-form']
            .slice(1).split('.').map(Number)
        expect(major === 1 && (minor > 1 || (minor === 1 && patch >= 1))).toBe(true)
    })

    it('has no lifecycle scripts besides prepare', () => {
        const lifecycle = [
            'preinstall', 'install', 'postinstall', 'prepublish',
            'preprepare', 'postprepare', 'prepublishOnly', 'prepack', 'postpack',
            'publish', 'postpublish',
        ]
        expect(Object.keys(pkg.scripts).filter((s) => lifecycle.includes(s))).toEqual([])
        expect(Object.keys(pkg.scripts).sort()).toEqual(['lint', 'prepare', 'test'])
        expect(pkg.scripts.prepare).toBe('husky')
    })

    it('ships the starter folders plus the changelog', () => {
        // What `nera new --starter` copies (nera-cli/src/starter.js) is pages,
        // config, theme, assets, plugins and .neraignore; this starter uses the
        // first three. That the folders exist is asserted once step 4 adds them.
        expect([...pkg.files].sort()).toEqual(['CHANGELOG.md', 'config', 'pages', 'theme'])
    })

    it('declares the toolchain floor and the npm package form', () => {
        expect(pkg.engines.node).toBe('>=22.12.0')
        expect(pkg.repository.url).toMatch(/^git\+https:\/\/github\.com\/seebaermichi\/nera-starter-business\.git$/)
        expect(pkg.devDependencies['@nera-static/nera']).toMatch(/^\^1\.(1[3-9]|[2-9]\d)\./)
    })
})

// The plugins whose templates the starter ships as vendor copies.
const TEMPLATE_PLUGINS = ['plugin-contact-form', 'plugin-images', 'plugin-navigation', 'plugin-social-media-links']

// The seams the starter fills: §S3.2 of ROADMAP-themes.md plus the shared ones.
const SEAMS = ['hero-media', 'card-media', 'contact-form', 'nav-main', 'footer-extra']

// Loads Font Awesome from a CDN, which the privacy check would flag.
const CDN_PARTIAL = 'fontawesome-cdn-link.pug'

/** Lists the files under `dir` as paths relative to it, sorted. */
function listFiles(dir) {
    return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
        .sort()
}

describe('theme folder', () => {
    it('ships none of the scaffold-default views, which would shadow the theme', () => {
        for (const file of ['theme/views/layouts/layout.pug', 'theme/views/pages/default.pug']) {
            expect(fs.existsSync(path.join(root, file)), file).toBe(false)
        }
    })

    it('fills the seams', () => {
        for (const seam of SEAMS) {
            expect(fs.existsSync(path.join(root, 'theme/views/partials', `${seam}.pug`)), seam).toBe(true)
        }
    })

    it('ships no CDN partial', () => {
        expect(listFiles(path.join(root, 'theme')).filter((f) => path.basename(f) === CDN_PARTIAL)).toEqual([])
    })

    it.each(TEMPLATE_PLUGINS)('vendors the templates of the installed %s unchanged', (plugin) => {
        const source = path.join(root, 'node_modules/@nera-static', plugin, 'views')
        const vendor = path.join(root, 'theme/views/vendor', plugin)
        const templates = listFiles(source).filter((f) => f.endsWith('.pug') && path.basename(f) !== CDN_PARTIAL)
        expect(listFiles(vendor)).toEqual(templates)
        for (const file of templates) {
            expect(fs.readFileSync(path.join(vendor, file), 'utf-8'), file)
                .toBe(fs.readFileSync(path.join(source, file), 'utf-8'))
        }
    })

    it('ships the contact form\'s client script unchanged', () => {
        const source = path.join(root, 'node_modules/@nera-static/plugin-contact-form/views/contact-form.js')
        expect(fs.readFileSync(path.join(root, 'theme/assets/js/contact-form.js'), 'utf-8'))
            .toBe(fs.readFileSync(source, 'utf-8'))
    })
})

/** Parses `config/<name>.yaml`. */
function readConfig(name) {
    return parse(fs.readFileSync(path.join(root, 'config', `${name}.yaml`), 'utf-8'))
}

/** The literal keys of every `t('…')` call in the .pug files under `dir`. */
function literalKeys(dir) {
    return listFiles(dir)
        .filter((f) => f.endsWith('.pug'))
        .flatMap((f) => [...fs.readFileSync(path.join(dir, f), 'utf-8').matchAll(/\bt\('([^']+)'\)/g)])
        .map((match) => match[1])
}

/** The texts of config/contact-form.yaml, every one a t() key in the plugin's template. */
function contactFormKeys(config) {
    const keys = [
        'subject', 'submit_label', 'error_required', 'error_email',
        'checkbox_checked_label', 'checkbox_unchecked_label', 'intro_text', 'consent_text',
    ].map((key) => config[key])
    for (const field of config.fields) {
        keys.push(field.label, ...(field.options || []).map((option) => option.label))
        if (field.placeholder) keys.push(field.placeholder)
    }
    return keys
}

describe('site config', () => {
    const appYaml = fs.readFileSync(path.join(root, 'config/app.yaml'), 'utf-8')
    const app = parse(appYaml)

    it('keeps the lines `nera new --name/--lang` edit, the theme and a translations entry', () => {
        // setAppValue and addLangTranslations in nera-cli/src/scaffold.js are line-based.
        expect(appYaml).toMatch(/^name: \S.*$/m)
        expect(appYaml).toMatch(/^lang: en$/m)
        expect(appYaml).toMatch(/^theme: business$/m)
        expect(appYaml).toMatch(/^translations:\n {4}en:$/m)
    })

    it('fills app.business without an email, with readable opening hours', () => {
        expect(app.business.email).toBeUndefined()
        for (const key of ['street', 'postal_code', 'city', 'country', 'phone']) {
            expect(typeof app.business[key], key).toBe('string')
        }
        // The theme shows a row only when it is closed or has both times.
        for (const row of app.business.hours) {
            expect(row.closed === true || (/^\d\d:\d\d$/.test(row.opens) && /^\d\d:\d\d$/.test(row.closes)), row.days)
                .toBe(true)
        }
    })

    it('translates every theme, plugin, footer-link and opening-hours key', () => {
        const keys = new Set([
            'language_name',
            ...literalKeys(path.join(root, 'node_modules/@nera-static/theme-business/views')),
            ...literalKeys(path.join(root, 'theme/views')),
            ...readConfig('theme').footer_links.map((link) => link.label),
            ...app.business.hours.map((row) => row.days),
            app.business.hours_note,
            ...contactFormKeys(readConfig('contact-form')),
        ])
        const missing = [...keys].filter((key) => typeof app.translations.en[key] !== 'string')
        expect(missing).toEqual([])
    })

    it('links the imprint and the privacy page from the footer and the consent text', () => {
        expect(readConfig('theme').footer_links).toEqual([
            { label: 'Imprint', href: '/imprint.html' },
            { label: 'Privacy', href: '/privacy.html' },
        ])
        expect(app.translations.en.contact_consent).toContain('href="/privacy.html"')
    })

    it('asks only for name, email, message and the privacy checkbox (plan D5)', () => {
        const form = readConfig('contact-form')
        expect(form.recipient).toBe('hello@example.com')
        expect(form.fields.map((field) => [field.name, field.type])).toEqual([
            ['name', 'text'], ['email', 'email'], ['message', 'textarea'], ['privacy', 'checkbox'],
        ])
        expect(form.fields.every((field) => field.required)).toBe(true)
    })

    it('configures images, navigation and social links as the theme expects', () => {
        expect(readConfig('images')).toEqual({ eager_first: false, og: false, frontmatter_keys: ['image'] })
        const navigation = readConfig('navigation')
        expect(Object.keys(navigation)).toEqual(['elements'])
        expect(navigation.elements.map((element) => element.href)).toEqual([
            '/index.html', '/about.html', '/services.html', '/opening-hours.html', '/contact.html',
        ])
        const social = readConfig('social-media-links')
        expect(social.open_in_new_tab).toBe(false)
        expect(social.social_media_links).toHaveLength(1)
    })
})
