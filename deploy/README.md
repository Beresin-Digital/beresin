# Deploy ke klomang

Push ke `master` menjalankan build, pemeriksaan HTML dan smoke test, lalu
mengirim image Docker lewat SSH. PR hanya menjalankan build dan smoke test.
`workflow_dispatch` juga tersedia untuk deploy ulang `master`.

```text
Internet -> Nginx Proxy Manager (TLS) -> beresin-app:4321 -> Postgres
```

NPM tetap memakai jaringan eksternal `proxy-tier`. App dan database tidak
membuka port di host. Database memakai role aplikasi tanpa superuser; role
tersebut memiliki database supaya bisa menjalankan migration.

Server menyimpan konfigurasi di `/home/moon/apps/beresin/.env` (mode 600):
`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_OWNER_PASSWORD`, `SESSION_SECRET`,
dan `LEAD_IP_HMAC_SECRET`. Rahasia ini hanya ada di server. Jangan mengganti
password `.env` setelah database dibuat tanpa mengganti role Postgres juga.

GitHub repository memakai secrets `KLOMANG_SSH_KEY`, `KLOMANG_KNOWN_HOSTS`
dan variables `KLOMANG_HOST`, `KLOMANG_USER`. `PUBLIC_GA4_ID` opsional dan
dibaca saat build. Key CI memakai user `moon`, yang memiliki akses Docker;
batasi siapa yang boleh mengubah workflow dan push ke `master`.

## Nginx Proxy Manager

Proxy Host untuk `beresindigital.id` dan `www.beresindigital.id`:

- Scheme: `http`
- Forward Hostname: `beresin-app`
- Forward Port: `4321`
- SSL: pertahankan sertifikat dan Force SSL yang sudah ada.
- Advanced: isi konfigurasi berikut. Ini mengganti header IP dari pengunjung
  dengan alamat koneksi yang diterima NPM, dan meneruskan HTTPS ke Astro.

```nginx
location / {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass $forward_scheme://$server:$port$request_uri;
}
```

Jika menambahkan CDN di depan NPM, konfigurasi trusted real-IP CDN dulu;
tanpa itu rate limit akan memakai IP CDN.

## Operasional

Masuk dengan `ssh klomang`, lalu:

```bash
cd /home/moon/apps/beresin
export BERESIN_IMAGE=$(cat current/image)
docker compose -p beresin --env-file .env -f current/compose.yml ps
docker compose -p beresin --env-file .env -f current/compose.yml logs --tail=100 app

# Membuat akun admin dengan prompt kata sandi tersembunyi.
docker compose -p beresin --env-file .env -f current/compose.yml exec app node scripts/seed-admin.mjs

# Backup database; simpan salinannya di luar server juga.
docker compose -p beresin --env-file .env -f current/compose.yml exec -T db \
  sh -c 'pg_dump -U postgres "$POSTGRES_DB"' > "backup-$(date +%Y%m%d-%H%M%S).sql"
```

Akun awal `admin@beresin.id` disiapkan saat provisioning. Kata sandi acaknya
ada di `/home/moon/apps/beresin/admin-initial.json` (mode 600). Ambil lewat
SSH, simpan di password manager, lalu hapus file itu setelah tersimpan.

Volume `beresin_pgdata` menyimpan database; `beresin_uploads` menyimpan lead
fallback saat database tidak tersedia. Backup kedua volume dan `.env`.
Jangan menjalankan `docker compose down -v` pada production.

Deploy yang gagal health check mengembalikan image app sebelumnya. Migration
database tidak di-rollback otomatis; periksa SQL destruktif sebelum push.
Untuk rollback manual, pilih SHA sebelumnya di direktori `releases`:

```bash
bash releases/<SHA>/deploy.sh beresin:<SHA>
```

Deploy mengganti satu container app, sehingga ada jeda singkat saat restart.
Image dan direktori release lama disimpan untuk rollback; hapus yang sudah
tidak diperlukan secara berkala. Backup terjadwal belum dikonfigurasi.
Email relay dan Turnstile mengikuti implementasi project yang sudah ada;
pipeline ini tidak menambahkan integrasi baru.
