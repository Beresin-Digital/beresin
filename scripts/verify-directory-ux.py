import os
from urllib.parse import parse_qs, urlsplit

from playwright.sync_api import expect, sync_playwright


base = os.environ.get('BASE_URL', 'http://127.0.0.1:4321').rstrip('/')
region = '/sekolah/sulawesi-selatan/bantaeng'
profile = region + '/69988522'

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    try:
        context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base + '/') else route.abort())
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        records = context.request.get(base + '/sekolah/index-pencarian.json').json()
        smk_count = sum(school['educationLevel'] == 'SMK' for school in records)
        smk_query_count = sum('smk' in (school['name'] + ' ' + school['npsn']).lower() for school in records)
        status = page.locator('[data-search-status]')

        page.goto(base + '/sekolah', wait_until='networkidle')
        expect(page.locator('aside')).to_contain_text('Sulawesi Selatan')
        expect(page.locator('aside')).to_contain_text('DI Yogyakarta')
        assert page.get_by_role('button', name='Cari sekolah', exact=True).bounding_box()['y'] + 48 <= 844
        page.get_by_role('link', name='Kabupaten Bantaeng', exact=False).click()
        assert page.url == base + region
        page.goto(base + '/sekolah', wait_until='networkidle')
        page.locator('#directory-search').fill('69988522')
        page.locator('#directory-search').press('Enter')
        expect(status).to_contain_text('1 sekolah ditemukan.')

        page.goto(base + '/sekolah/cari?q=smk', wait_until='networkidle')
        expect(status).to_contain_text(f'{smk_query_count} sekolah ditemukan.')
        page.locator('#school-query').fill('69988522')
        page.locator('#school-query').press('Enter')
        expect(status).to_contain_text('1 sekolah ditemukan.')
        assert parse_qs(urlsplit(page.url).query)['q'] == ['69988522']
        page.go_back(wait_until='networkidle')
        expect(page.locator('#school-query')).to_have_value('smk')
        expect(status).to_contain_text(f'{smk_query_count} sekolah ditemukan.')
        page.go_forward(wait_until='networkidle')
        expect(page.locator('#school-query')).to_have_value('69988522')
        expect(status).to_contain_text('1 sekolah ditemukan.')
        page.reload(wait_until='networkidle')
        expect(page.locator('#school-query')).to_have_value('69988522')
        expect(status).to_contain_text('1 sekolah ditemukan.')

        page.locator('#school-query').fill('')
        page.locator('#school-level').select_option('SMK')
        expect(status).to_contain_text(f'{smk_count} sekolah ditemukan.')
        page.reload(wait_until='networkidle')
        expect(page.locator('#school-level')).to_have_value('SMK')
        expect(status).to_contain_text(f'{smk_count} sekolah ditemukan.')
        assert parse_qs(urlsplit(page.url).query) == {'level': ['SMK']}

        sma_count = sum(school['educationLevel'] == 'SMA' and school['regency'] == 'Kabupaten Bantaeng' and school['province'] == 'Sulawesi Selatan' for school in records)
        page.goto(base + region + '?level=SMA', wait_until='networkidle')
        expect(page.locator('#school-level')).to_have_value('SMA')
        expect(status).to_contain_text(f'{sma_count} sekolah ditemukan.')
        expect(page.locator('[data-static-list]')).to_be_hidden()
        expect(page.locator('[data-filter-results] .school-card').first.locator('.school-level')).to_have_text('SMA')
        expect(page.locator('[data-filter-results] .school-card').first.locator('.school-npsn')).to_contain_text('NPSN ')
        page.reload(wait_until='networkidle')
        expect(status).to_contain_text(f'{sma_count} sekolah ditemukan.')

        page.goto(base + region + '/halaman/9?q=69988522&level=SMK&district=Bantaeng', wait_until='networkidle')
        expect(page.locator('#school-level')).to_have_value('SMK')
        expect(page.locator('#school-district')).to_have_value('Bantaeng')
        expect(status).to_contain_text('1 sekolah ditemukan.')
        expect(page.locator('[data-filter-results] a')).to_have_attribute('href', profile)
        page.reload(wait_until='networkidle')
        expect(page.locator('#school-district')).to_have_value('Bantaeng')
        expect(status).to_contain_text('1 sekolah ditemukan.')
        page.locator('[data-filter-results] a').click()
        assert page.url == base + profile
        page.go_back(wait_until='networkidle')
        expect(page.locator('#school-query')).to_have_value('69988522')
        expect(page.locator('#school-level')).to_have_value('SMK')
        expect(page.locator('#school-district')).to_have_value('Bantaeng')
        expect(status).to_contain_text('1 sekolah ditemukan.')
        page.get_by_role('button', name='Reset pencarian dan filter', exact=True).click()
        expect(page.locator('[data-static-list]')).to_be_visible()
        expect(page.locator('[data-static-pagination]')).to_be_visible()
        assert urlsplit(page.url).query == ''

        page.goto(base + '/sekolah/cari?q=69988522&level=invalid', wait_until='networkidle')
        expect(page.locator('#school-level')).to_have_value('')
        expect(status).to_contain_text('1 sekolah ditemukan.')
        page.locator('#school-query').fill('no-match-12345')
        page.locator('#school-query').press('Enter')
        expect(status).to_contain_text('Tidak ada sekolah yang cocok.')
        page.reload(wait_until='networkidle')
        expect(status).to_contain_text('Tidak ada sekolah yang cocok.')

        page.goto(base + '/sekolah', wait_until='networkidle')
        summary = page.locator('.mobile-menu summary')
        menu = page.locator('.mobile-menu')
        summary.focus()
        summary.press('Enter')
        expect(menu).to_have_attribute('open', '')
        page.locator('.mobile-menu a').last.focus()
        page.keyboard.press('Tab')
        expect(menu).not_to_have_attribute('open', '')
        assert page.evaluate('''() => {
            const el = document.activeElement, r = el.getBoundingClientRect();
            return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
        }''')
        summary.focus()
        summary.press('Enter')
        page.keyboard.press('Shift+Tab')
        expect(menu).not_to_have_attribute('open', '')
        summary.focus()
        summary.press('Enter')
        page.keyboard.press('Escape')
        expect(menu).not_to_have_attribute('open', '')
        expect(summary).to_be_focused()

        page.goto(base + profile, wait_until='networkidle')
        expect(page.locator('[data-profile-source]')).to_have_text('Data per 6 Okt 2026 · Sumber: Dapodik Kemendikdasmen')
        assert page.locator('[data-profile-source]').bounding_box()['y'] < page.locator('#school-contact').bounding_box()['y'] < page.locator('#school-facts').bounding_box()['y']
        page.get_by_role('link', name='Hubungi sekolah', exact=True).click()
        heading = page.locator('#school-contact')
        expect(heading).to_be_focused()
        assert heading.bounding_box()['y'] >= page.locator('header').bounding_box()['height']
        expect(page.locator('a[href^="tel:"]')).to_be_in_viewport()
        assert errors == [], errors
        context.close()

        # API stubs exercise platform support, cancellation, and denied permissions without sending a share.
        for mode in ['copy', 'copy-pending', 'copy-denied', 'copy-unavailable', 'share', 'share-cancelled', 'share-denied']:
            context = browser.new_context(viewport={'width': 390, 'height': 844})
            context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base + '/') else route.abort())
            context.add_init_script('''(mode => {
                window.shared = null;
                window.copied = null;
                Object.defineProperty(navigator, 'share', {configurable: true, value:
                    mode.startsWith('share') ? async data => {
                        if (mode === 'share-cancelled') throw new DOMException('Cancelled', 'AbortError');
                        if (mode === 'share-denied') throw new DOMException('Denied', 'NotAllowedError');
                        window.shared = data;
                    } : undefined});
                Object.defineProperty(navigator, 'clipboard', {configurable: true, value:
                    mode === 'copy-unavailable' ? undefined : {writeText: async value => {
                        if (mode === 'copy-denied') throw new DOMException('Denied', 'NotAllowedError');
                        if (mode === 'copy-pending') await new Promise(resolve => window.finishCopy = resolve);
                        window.copied = value;
                    }}});
            })(''' + repr(mode) + ')')
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base + profile + '?utm_source=test#school-source', wait_until='networkidle')
            field = page.locator('#school-profile-url')
            share_status = page.locator('[data-share-status]')
            canonical = 'https://beresindigital.id' + profile
            expect(field).to_have_value(canonical)
            button = page.get_by_role('button', name='Bagikan profil' if mode.startswith('share') else 'Salin tautan', exact=True)
            if mode.startswith('copy'):
                expect(page.locator('[data-share-profile]')).to_be_hidden()
            button.focus()
            button.press('Enter')
            if mode == 'copy-pending':
                expect(button).to_be_disabled()
                expect(share_status).to_have_text('Menyalin tautan…')
                page.evaluate('window.finishCopy()')
            expect(button).to_be_enabled()
            if mode in ['copy', 'copy-pending']:
                expect(share_status).to_have_text('Tautan profil berhasil disalin.')
                assert page.evaluate('window.copied') == canonical
            elif mode == 'share':
                expect(share_status).to_have_text('Tautan diteruskan ke menu berbagi.')
                data = page.evaluate('window.shared')
                assert data['url'] == canonical
                assert data['title'] == page.locator('h1').inner_text()
            elif mode == 'share-cancelled':
                expect(share_status).to_have_text('')
                expect(page.locator('[data-profile-link]')).not_to_have_attribute('open', '')
            else:
                expect(share_status).to_contain_text('Salin tautan profil yang sudah dipilih.')
                expect(field).to_be_visible()
                expect(field).to_be_focused()
                assert field.evaluate('(el) => el.selectionStart === 0 && el.selectionEnd === el.value.length')
                assert page.evaluate('window.copied') is None
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert errors == [], errors
            context.close()

        nojs = browser.new_context(java_script_enabled=False)
        page = nojs.new_page()
        page.goto(base + region + '/halaman/9', wait_until='networkidle')
        expect(page.locator('[data-static-list] a').first).to_be_visible()
        page.goto(base + profile, wait_until='networkidle')
        expect(page.get_by_role('link', name='Hubungi sekolah', exact=True)).to_have_attribute('href', '#school-contact')
        expect(page.locator('[data-copy-profile]')).to_be_hidden()
        page.locator('[data-profile-link] summary').click()
        expect(page.locator('#school-profile-url')).to_be_visible()
        expect(page.locator('#school-profile-url')).to_have_value('https://beresindigital.id' + profile)
        nojs.close()
    finally:
        browser.close()

print('Directory UX checks passed: search/filter URL, reload, history, global filter, mobile keyboard menu, contact shortcut, canonical copy/share, denied permissions, cancellation, and no-JS browse.')
