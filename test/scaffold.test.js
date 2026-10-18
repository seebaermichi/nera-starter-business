import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'node_modules', '@nera-static', 'nera', 'bin', 'nera.js')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))

const TIMEOUT = 180_000

// What `nera new --starter` copies into a site (nera-cli/src/starter.js).
const STARTER_ENTRIES = ['pages', 'config', 'theme', 'assets', 'plugins', '.neraignore']

// The seven pages of ROADMAP-ai.md L5 (plan D2).
const PAGES = [
    'index.html', 'about.html', 'services.html', 'opening-hours.html',
    'contact.html', 'imprint.html', 'privacy.html',
]

// The theme fixture's config/validate.yaml (nera-theme-business test/site):
// every rule of `nera check` on, the opt-in ones included, promoted to error
// so a finding fails the check; its legal paths reduced to the English pages.
const STRICT_VALIDATE = `rules:
${[
        'a11y-html-lang', 'a11y-title', 'a11y-h1', 'a11y-heading-skip', 'a11y-img-alt',
        'a11y-form-label', 'a11y-link-name', 'a11y-main', 'a11y-skip-link', 'a11y-nav-name',
        'a11y-duplicate-id', 'a11y-viewport-zoom', 'a11y-link-lang', 'a11y-target-blank',
        'a11y-reduced-motion', 'privacy-third-party', 'privacy-insecure', 'privacy-storage',
        'legal-imprint-link', 'legal-privacy-link', 'legal-outdated-law',
    ].map((rule) => `    ${rule}: error`).join('\n')}
legal:
    imprint:
        en: /imprint.html
    privacy:
        en: /privacy.html
`

let tmp

beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nera-starter-business-'))
})

afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
})

const nera = (args, cwd) =>
    execFileSync(process.execPath, [cli, ...args], {
        cwd,
        encoding: 'utf-8',
        stdio: 'pipe',
    })

// Scaffold `name` from this repo with the devDependency CLI, offline: a
// local starter path is read in place and --no-install skips npm. The site
// then resolves the CLI, the theme and the plugins from this repo's
// node_modules (they are this package's dependencies).
function scaffold(name, extra = []) {
    nera(['new', name, '--starter', root, '--yes', '--no-install', ...extra], tmp)
    const site = path.join(tmp, name)
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(site, 'node_modules'), 'dir')
    return site
}

const read = (dir, file) => fs.readFileSync(path.join(dir, file), 'utf-8')

// Every file below `dir`, as paths relative to it.
function walk(dir, base = dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name)
        return entry.isDirectory() ? walk(full, base) : [path.relative(base, full)]
    })
}

// Build, check and validate: no finding, and no warning from core or a
// plugin anywhere in the build's text output.
function expectCleanBuild(site) {
    const out = nera(['build', '--check'], site)
    expect(out).toContain('No problems found')
    expect(out).not.toMatch(/\d+ error\(s\), \d+ warning\(s\)/)
    expect(out).not.toMatch(/warn|⚠/i)

    const json = JSON.parse(nera(['build', '--check', '--json'], site))
    expect(json).toEqual({ ok: true, results: [] })

    expect(nera(['validate'], site)).toContain('No problems found')
    expect(JSON.parse(nera(['validate', '--json'], site))).toEqual({ ok: true, results: [] })
}

describe('the sample pages', () => {
    const files = fs.readdirSync(path.join(root, 'pages'))

    it('are the seven pages of L5, each with a layout and without lang or slug (plan D1, D2)', () => {
        expect(files.sort()).toEqual(PAGES.map((p) => p.replace(/\.html$/, '.md')).sort())
        for (const file of files) {
            const front = read(path.join(root, 'pages'), file).split(/^---$/m)[1]
            expect(front, file).toMatch(/^layout: pages\/\w+\.pug$/m)
            expect(front, file).not.toMatch(/^(?:lang|slug):/m)
        }
    })

    it('never name the business, so `nera new --name` renames the whole site', () => {
        for (const file of files) {
            expect(read(path.join(root, 'pages'), file), file).not.toMatch(/Brot|Zeit/)
        }
    })

    it('start their bodies at ##', () => {
        for (const file of files) {
            const body = read(path.join(root, 'pages'), file).split(/^---$/m).slice(2).join('---')
            expect(body, file).not.toMatch(/^# /m)
        }
    })
})

describe('nera new --starter <this repo>', () => {
    let site

    beforeAll(() => {
        site = scaffold('site')
    }, TIMEOUT)

    it('scaffolds a site that builds, checks and validates clean', () => {
        expectCleanBuild(site)
    }, TIMEOUT)

    it('stays clean with every check rule on and promoted to error', () => {
        const strict = scaffold('site-strict')
        fs.writeFileSync(path.join(strict, 'config', 'validate.yaml'), STRICT_VALIDATE)
        expectCleanBuild(strict)
    }, TIMEOUT)

    it('renders every page and the sitemap', () => {
        const pub = path.join(site, 'public')
        for (const file of [...PAGES, 'sitemap.xml', 'robots.txt']) {
            expect(fs.existsSync(path.join(pub, file)), file).toBe(true)
        }
        const sitemap = read(site, 'public/sitemap.xml')
        // The legal pages are `robots: noindex`, so the sitemap leaves them out.
        for (const page of PAGES) {
            const loc = `<loc>https://example.com/${page}</loc>`
            if (['imprint.html', 'privacy.html'].includes(page)) expect(sitemap, page).not.toContain(loc)
            else expect(sitemap, page).toContain(loc)
        }
        expect(read(site, 'public/robots.txt')).toContain('Sitemap: https://example.com/sitemap.xml')
    })

    it('fills the seams: navigation, hero picture, social links, address and opening hours', () => {
        const home = read(site, 'public/index.html')
        expect(home).toContain('<ul class="nav nav--list">')
        expect(home).toMatch(/<div class="hero__media">\s*<picture>/)
        expect(home).toContain('class="hero__image"')
        expect(home).toContain('alt="Loaves of sourdough bread on a wooden counter"')
        expect(home).toContain('<a class="button" href="/contact.html">Order for pickup</a>')
        expect(home.match(/<li class="card">/g)).toHaveLength(3)
        expect(home).toContain('<nav class="social-media-links" aria-label="Social media">')
        expect(home).not.toContain('target="_blank"')

        // The opening hours and the address come from app.business. The
        // footer shows both on every page, so look at <main> alone.
        const main = (file) => {
            const match = read(site, `public/${file}`).match(/<main\b[\s\S]*?<\/main>/)
            expect(match, file).not.toBeNull()
            return match[0]
        }
        for (const file of ['index.html', 'opening-hours.html', 'contact.html']) {
            const page = main(file)
            expect(page, file).toContain('<dt class="opening-hours__days">Mon–Fri</dt>')
            expect(page, file).toContain('<time datetime="07:00">07:00</time> – <time datetime="18:00">18:00</time>')
            expect(page, file).toContain('<dd class="opening-hours__time">Closed</dd>')
            expect(page, file).toContain('<p class="opening-hours__note">Closed on public holidays.</p>')
        }
        expect(main('about.html')).not.toContain('<dl class="opening-hours">')
        expect(main('contact.html')).toContain('<a class="address__link" href="tel:+49301234567">')
    })

    it('renders the contact form with its recipient hidden and its script loaded', () => {
        const contact = read(site, 'public/contact.html')
        expect(contact).toContain('<form class="contact-form" novalidate data-contact-form>')
        for (const label of ['Your name', 'Your email', 'Message', 'I have read the privacy notice']) {
            expect(contact).toContain(label)
        }
        expect(contact).toContain('<a href="/privacy.html">privacy notice</a>')
        expect(contact).not.toContain('hello@example.com')
        expect(contact).toContain('<script src="/js/contact-form.js"></script>')
    })

    it('makes no third-party request and ships only the contact-form script', () => {
        const pub = path.join(site, 'public')
        const html = walk(pub).filter((f) => f.endsWith('.html'))
        expect(html.length).toBe(PAGES.length)
        for (const file of html) {
            const page = read(pub, file)
            const scripts = [...page.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => tag)
            const expected = file === 'contact.html'
                ? ['<script type="application/json" data-contact-config>', '<script src="/js/contact-form.js">']
                : []
            expect(scripts, file).toEqual(expected)
            expect(page, file).not.toMatch(/<(?:link|img|source|iframe|video|audio)\b[^>]*\s(?:href|src|srcset)="(?:https?:)?\/\//i)
        }
        expect(walk(pub).filter((f) => f.endsWith('.js'))).toEqual(['js/contact-form.js'])
        for (const file of walk(pub).filter((f) => f.endsWith('.css'))) {
            expect(read(pub, file), file).not.toMatch(/url\(\s*['"]?(?:https?:)?\/\/|@import/i)
        }
    })

    it('links only to pages and files that exist', () => {
        const pub = path.join(site, 'public')
        for (const file of walk(pub).filter((f) => f.endsWith('.html'))) {
            for (const [, url] of read(pub, file).matchAll(/\s(?:href|src)="(\/[^"#?]*)/g)) {
                expect(fs.existsSync(path.join(pub, url)), `${file} → ${url}`).toBe(true)
            }
            for (const [, set] of read(pub, file).matchAll(/\ssrcset="([^"]*)"/g)) {
                for (const url of set.split(',').map((s) => s.trim().split(/\s+/)[0])) {
                    expect(fs.existsSync(path.join(pub, url)), `${file} → ${url}`).toBe(true)
                }
            }
        }
    })

    it('copies only the starter folders into the site, byte for byte', () => {
        for (const file of [
            'README.md', 'CHANGELOG.md', 'LICENSE', 'eslint.config.js',
            'package-lock.json', 'test', '.github', '.husky', 'plans',
        ]) {
            expect(fs.existsSync(path.join(site, file)), file).toBe(false)
        }
        const entries = STARTER_ENTRIES.filter((e) => fs.existsSync(path.join(root, e)))
        const files = entries.flatMap((e) => walk(path.join(root, e)).map((f) => path.join(e, f)))
        expect(files.length).toBeGreaterThan(30)
        for (const file of files) {
            expect(fs.readFileSync(path.join(site, file)).equals(fs.readFileSync(path.join(root, file))), file)
                .toBe(true)
        }
    })

    it('leaves out the scaffold\'s nera:scaffold-default views', () => {
        for (const file of ['theme/views/layouts/layout.pug', 'theme/views/pages/default.pug']) {
            expect(fs.existsSync(path.join(site, file)), file).toBe(false)
        }
    })

    it('keeps the site\'s own CLI entry and adds the theme and the plugins', () => {
        const sitePkg = JSON.parse(read(site, 'package.json'))
        expect(sitePkg.name).toBe('site')
        expect(sitePkg.dependencies).toHaveProperty('@nera-static/nera')
        expect(sitePkg.dependencies).toEqual({
            '@nera-static/nera': sitePkg.dependencies['@nera-static/nera'],
            ...pkg.dependencies,
        })
    })
})
