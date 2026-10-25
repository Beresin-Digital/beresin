#!/usr/bin/env bash
# check-prod-origin.sh — origin check pasca-deploy prod.
# Origin check pasca-deploy prod, dijalankan DI klomang via SSH yang sudah
# dipakai workflow deploy, mis.:
#   ssh moon@<klomang-host> 'bash -s' < scripts/check-prod-origin.sh
#
# Kenapa bukan dari runner: Cloudflare Bot Fight Mode (Free) memblokir runner
# GitHub dan TIDAK BISA di-skip oleh WAF custom rule / Page Rule (dokumen resmi).
# --resolve mengarahkan beresindigital.id + www.beresindigital.id ke NPM lokal
# (127.0.0.1:443), jadi check melewati Cloudflare sepenuhnya. SNI + sertifikat
# Let's Encrypt tetap valid karena Host tidak berubah.
#
# Cakupan: subset setia dari scripts/verify-deploy.mjs (GET 11 path, sitemap,
# llms.txt + link-linknya, /sekolah/index-pencarian.json + profil pertama,
# /admin 302, 5 kasus POST /api/contact). YANG DIDROP vs .mjs: pencocokan
# lastmod sitemap artikel vs JSON-LD dateModified (butuh parsing JSON-LD;
# tetap dicover script penuh di deploy staging).
# Header spoof (X-Forwarded-*) disamakan dengan verify-deploy.mjs.
# Exit nonzero jika ada satu pun check gagal.
# BELUM PERNAH DITES DARI KLOMANG — validasi terjadi pada deploy prod pertama
# sesudah step workflow ini aktif. Jika --resolve gagal di klomang (mis. NPM
# tidak listen di 127.0.0.1), fallback-nya jalur staging-box + IP rule.
set -uo pipefail

BASE="https://beresindigital.id"
RESOLVE=(--resolve "beresindigital.id:443:127.0.0.1" --resolve "www.beresindigital.id:443:127.0.0.1")
HDR=(-H "X-Forwarded-Host: beresindigital.id" -H "X-Forwarded-Proto: https" -H "X-Forwarded-For: 203.0.113.20")
FAIL=0

note() { if [ "$1" = 0 ]; then echo "ok: $2"; else echo "FAIL: $2"; FAIL=1; fi; }

expect_status() { # url code name
  local got; got=$(curl -s -o /dev/null -w '%{http_code}' "${RESOLVE[@]}" "${HDR[@]}" "$1")
  [ "$got" = "$2" ]; note $? "$3 (HTTP $got, harap $2)"
}

expect_absent() { # url needle name
  local body; body=$(curl -s "${RESOLVE[@]}" "${HDR[@]}" "$1")
  ! grep -q "$2" <<<"$body"; note $? "$3"
}

expect_present() { # url needle name
  local body; body=$(curl -s "${RESOLVE[@]}" "${HDR[@]}" "$1")
  grep -q "$2" <<<"$body"; note $? "$3"
}

# --- GET paths -> 200 (sama dengan verify-deploy.mjs) ---
for p in / /portfolio /articles /contact /admin/login /sitemap.xml /sitemap-site.xml /sekolah /sekolah/cari /sekolah/tentang-data /sekolah/sitemap.xml; do
  expect_status "$BASE$p" 200 "GET $p"
done

# --- sitemap-site.xml nonempty ---
sitemap=$(curl -s "${RESOLVE[@]}" "${HDR[@]}" "$BASE/sitemap-site.xml")
grep -q "<url>" <<<"$sitemap"; note $? "sitemap-site.xml nonempty"

# --- llms.txt: 200, text/plain, diawali '# Beresin Digital', semua link-nya 200 ---
llms_headers=$(curl -s -D - -o /tmp/llms.txt "${RESOLVE[@]}" "${HDR[@]}" "$BASE/llms.txt")
grep -qi "^content-type: text/plain" <<<"$llms_headers"; note $? "llms.txt content-type text/plain"
head -1 /tmp/llms.txt | grep -q "^# Beresin Digital$"; note $? "llms.txt diawali '# Beresin Digital'"
while read -r url; do
  [ -n "$url" ] || continue
  expect_status "$BASE$(sed 's|https://beresindigital.id||' <<<"$url")" 200 "llms.txt link: $url"
done < <(grep -o '](https://beresindigital.id[^)]*)' /tmp/llms.txt | sed 's/^](//; s/)$//')

# --- /sekolah/index-pencarian.json: 200, nonempty, profil pertama 200 + berisi NPSN ---
curl -s "${RESOLVE[@]}" "${HDR[@]}" "$BASE/sekolah/index-pencarian.json" -o /tmp/directory.json
[ -s /tmp/directory.json ]; note $? "index-pencarian.json nonempty"
first_path=$(grep -o '"path": *"[^"]*"' /tmp/directory.json | head -1 | sed 's/"path": *"//; s/"$//')
first_npsn=$(grep -o '"npsn": *"[^"]*"' /tmp/directory.json | head -1 | sed 's/"npsn": *"//; s/"$//')
if [ -n "$first_path" ] && [ -n "$first_npsn" ]; then
  expect_present "$BASE$first_path" "$first_npsn" "profil sekolah pertama berisi NPSN"
else
  echo "FAIL: tidak bisa membaca path/npsn pertama dari index-pencarian.json"; FAIL=1
fi

# --- /admin -> 302 ke /admin/login?next=%2Fadmin ---
admin_headers=$(curl -s -D - -o /dev/null "${RESOLVE[@]}" "${HDR[@]}" "$BASE/admin")
grep -qi "^HTTP/.* 302" <<<"$admin_headers"; note $? "/admin status 302"
grep -qi "^location: /admin/login?next=%2Fadmin" <<<"$admin_headers"; note $? "/admin Location tepat"

# --- POST /api/contact (5 kasus, sama dengan verify-deploy.mjs) ---
# Tidak ada baris lead yang dibuat oleh kasus-kasus ini (honeypot / validasi
# gagal / 403 — semua berhenti sebelum insert), sama seperti script .mjs.
post_case() { # name origin data expected_status expected_location_or_empty use_sfs
  local name="$1" origin="$2" data="$3" exp_status="$4" exp_loc="$5" use_sfs="$6"
  local args=("${RESOLVE[@]}" -H "Origin: $origin" --data "$data" -s -D - -o /dev/null)
  [ "$use_sfs" = "yes" ] && args+=(-H "sec-fetch-site: same-origin")
  if [ "$origin" = "https://www.beresindigital.id" ]; then
    # Sama seperti .mjs: Host + X-Forwarded-Host ditimpa www, sisanya dipertahankan.
    args+=(-H "Host: www.beresindigital.id" -H "X-Forwarded-Host: www.beresindigital.id" -H "X-Forwarded-Proto: https" -H "X-Forwarded-For: 203.0.113.20")
  else
    args+=("${HDR[@]}")
  fi
  local headers_out; headers_out=$(curl "${args[@]}" "$BASE/api/contact")
  local got_status; got_status=$(grep -i "^HTTP/" <<<"$headers_out" | tail -1 | awk '{print $2}')
  local got_loc; got_loc=$(grep -i "^location:" <<<"$headers_out" | tr -d '\r' | sed 's/^location: //I' | head -1)
  if [ "$got_status" = "$exp_status" ] && { [ -z "$exp_loc" ] || [ "$got_loc" = "$exp_loc" ]; }; then
    echo "ok: POST $name ($got_status${got_loc:+ -> $got_loc})"
  else
    echo "FAIL: POST $name (HTTP $got_status${got_loc:+ -> $got_loc}, harap $exp_status${exp_loc:+ -> $exp_loc})"; FAIL=1
  fi
}
post_case "honeypot ok" "https://beresindigital.id" "company_website=bot&page_url=/contact" 303 "/contact?terkirim=1" yes
post_case "nama kosong" "https://beresindigital.id" "page_url=/contact" 303 "/contact?gagal=nama" yes
post_case "page_url luar" "https://beresindigital.id" "company_website=bot&page_url=//evil.example" 303 "/?terkirim=1#contact" yes
post_case "www spoof" "https://www.beresindigital.id" "company_website=bot&page_url=/contact" 303 "/contact?terkirim=1" yes
post_case "evil origin" "https://evil.example" "company_website=bot" 403 "" no

# --- Halaman PR #2: 200 + nol inDepok ---
for p in /about /privacy-policy /terms-and-conditions /contact; do
  expect_status "$BASE$p" 200 "GET $p"
  expect_absent "$BASE$p" "inDepok" "nol inDepok di $p"
done
# Alias /terms (teramati menyajikan konten): cukup pastikan bebas inDepok.
expect_absent "$BASE/terms" "inDepok" "nol inDepok di /terms (alias)"

echo "----------------------------------------"
if [ "$FAIL" = 0 ]; then echo "ORIGIN CHECKS PASSED"; else echo "ORIGIN CHECKS FAILED"; fi
exit "$FAIL"
