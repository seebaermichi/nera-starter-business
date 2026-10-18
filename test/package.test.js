import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
