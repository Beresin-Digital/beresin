#!/usr/bin/env node
/**
 * Creates the first admin account.
 *
 * Run with `pnpm db:seed`. Three deliberate choices:
 *
 *  - The password is read from an interactive prompt with echo OFF. Not from
 *    argv (it would land in shell history and in `ps`) and not from `.env`
 *    (which is one careless `git add` away from being committed). This is why
 *    `.env.example` has no `ADMIN_PASSWORD`.
 *  - It connects as the *application* role (`DB_USER`), not the owner, so
 *    seeding also proves the least-privilege grants work.
 *  - `ON CONFLICT DO NOTHING` means re-running is a no-op and never resets a
 *    password that has since been changed.
 *
 * Plain `.mjs`, not `.ts`, so it runs without a loader.
 */
import { Algorithm, hash } from '@node-rs/argon2';
import { createInterface } from 'node:readline';
import postgres from 'postgres';
import { dbConfig, missingDbVars } from '../src/lib/db-env.mjs';

// .env is gitignored and absent in CI; a missing file is not an error here.
try {
  process.loadEnvFile('.env');
} catch {
  /* fall back to the real environment */
}

/** OWASP's recommended argon2id parameters. */
const ARGON2 = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

const MIN_PASSWORD_LENGTH = 12;

function ask(prompt) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Reads a line with the terminal echo disabled, by putting stdin into raw mode
 * and handling the characters ourselves. Backspace is honoured; Ctrl+C exits
 * cleanly. There is no fallback to a visible prompt on purpose — a silently
 * echoed password is worse than a refused run.
 */
function askSecret(prompt) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new Error('Butuh terminal interaktif untuk membaca kata sandi.'));
      return;
    }

    process.stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let value = '';

    const finish = (fn, arg) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
      process.stdout.write('\n');
      fn(arg);
    };

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') return finish(resolve, value);
        if (char === '\u0003') return finish(() => process.exit(130)); // Ctrl+C
        if (char === '\u007f' || char === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        if (char >= ' ') value += char;
      }
    };

    stdin.on('data', onData);
  });
}

function die(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

const missing = missingDbVars();
if (missing.length) {
  die(
    `Belum diisi: ${missing.join(', ')}.\n  Copy .env.example → .env lalu isi kredensialnya.`
  );
}

console.log('Membuat akun admin Beresin Digital.\n');

const email = (await ask('Email admin        : ')).trim().toLowerCase();
if (!email || !email.includes('@')) die('Email tidak valid.');

const name = (await ask('Nama admin         : ')).trim() || 'Admin';

const password = await askSecret('Kata sandi         : ');
if (password.length < MIN_PASSWORD_LENGTH) {
  die(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
}

const confirmation = await askSecret('Ulangi kata sandi  : ');
if (password !== confirmation) die('Kata sandi tidak sama.');

const passwordHash = await hash(password, ARGON2);

const sql = postgres(dbConfig(), { max: 1, onnotice: () => {} });

try {
  const rows = await sql`
    INSERT INTO admin_users (email, name, password_hash)
    VALUES (${email}, ${name}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;

  if (rows.length === 0) {
    console.log(`\n• Akun ${email} sudah ada — tidak ada yang diubah.`);
  } else {
    console.log(`\n✓ Admin ${email} dibuat (id ${rows[0].id}).`);
  }

  for (const key of ['SESSION_SECRET', 'LEAD_IP_HMAC_SECRET']) {
    if (!process.env[key] || process.env[key].includes('CHANGE_ME')) {
      console.warn(`! ${key} belum diisi — fitur yang memakainya tidak akan berfungsi.`);
    }
  }
} catch (err) {
  die(`Gagal menulis ke database: ${err.message}`);
} finally {
  await sql.end();
}
