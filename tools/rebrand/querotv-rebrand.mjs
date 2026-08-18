#!/usr/bin/env node
/**
 * QueroTV rebrand tool
 * -------------------------------------------------------------
 * Renames every "IPTVnator" brand identifier of this fork to "QueroTV",
 * as required by the upstream TRADEMARK.md policy
 * (https://github.com/4gray/iptvnator/blob/master/TRADEMARK.md).
 *
 * Usage:
 *   node tools/rebrand/querotv-rebrand.mjs            # apply
 *   node tools/rebrand/querotv-rebrand.mjs --check    # report only, exit 1 if pending
 *
 * The script is idempotent: running it twice changes nothing.
 */
import { readFileSync, writeFileSync, statSync, readdirSync, renameSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');

const SKIP_DIRS = new Set([
    '.git', 'node_modules', 'dist', 'tmp', '.nx', '.angular', 'coverage',
]);
/** Files we never touch (binary, lockfiles, upstream history). */
const SKIP_FILES = new Set([
    'pnpm-lock.yaml',
    'CHANGELOG.md', // upstream release history - keep factual
]);
const SKIP_EXT = /\.(png|jpe?g|gif|webp|ico|icns|woff2?|ttf|otf|mp4|zip|gz|xz|zst|node|so|dll|dylib|asar)$/i;

/**
 * Ordered replacements. Longest / most specific first.
 * Nominative references ("fork of IPTVnator") live in the legal docs, which
 * are listed in KEEP_AS_IS and therefore never rewritten.
 */
const REPLACEMENTS = [
    // upstream dependency tags must survive untouched (real git refs)
    [/github:4gray\/iptv-playlist-parser#v([\d.]+)-iptvnator\.(\d+)/g, '@@KEEP_PARSER_$1_$2@@'],
    // app / bundle identity
    [/com\.fourgray\.iptvnator/g, 'br.com.querotv.app'],
    [/iptvnator\.vercel\.app/g, 'querotv.vercel.app'],
    [/4gray\.github\.io\/iptvnator/g, 'ruysabino.github.io/quero.tv'],
    [/github\.com\/4gray\/iptvnator/g, 'github.com/ruysabino/quero.tv'],
    [/raw\.githubusercontent\.com\/4gray\/iptvnator/g, 'raw.githubusercontent.com/ruysabino/quero.tv'],
    [/4gray\/iptvnator/g, 'ruysabino/quero.tv'],
    // release feed / publish target (electron-updater would otherwise pull
    // upstream IPTVnator builds onto QueroTV installs)
    [/"owner":\s*"4gray"/g, '"owner": "ruysabino"'],
    [/"repo":\s*"iptvnator"/g, '"repo": "quero.tv"'],
    [/"name":\s*"4gray",\s*\n(\s*)"email":\s*"fourgray@proton\.me"/g,
        '"name": "Ruy Sabino Pereira",\n$1"email": "ruysabino@users.noreply.github.com"'],
    // TS path aliases: @iptvnator/* -> @querotv/*
    [/@iptvnator\//g, '@querotv/'],
    // storage keys, snap/flatpak ids, executable names
    [/iptvnator:/g, 'querotv:'],
    // plain identifiers
    [/IPTVnator/g, 'QueroTV'],
    [/IPTVNator/g, 'QueroTV'],
    [/IPTV-?Nator/g, 'QueroTV'],
    [/IPTVNATOR/g, 'QUEROTV'],
    [/iptvnator/g, 'querotv'],
    // restore preserved upstream refs
    [/@@KEEP_PARSER_([\d.]+)_(\d+)@@/g, 'github:4gray/iptv-playlist-parser#v$1-iptvnator.$2'],
];

/** Files whose brand mentions are intentional (legal / attribution). */
const KEEP_AS_IS = new Set([
    'LICENSE.md',
    'NOTICE.md',
    'TRADEMARK.md',
    'CHANGELOG.md',
    join('tools', 'rebrand', 'querotv-rebrand.mjs'),
]);

/** Paths that must be renamed on disk as well. */
function targetPath(p) {
    const base = p.split(sep).pop();
    if (!/iptvnator/i.test(base)) return null;
    const next = base
        .replace(/com\.fourgray\.iptvnator/g, 'br.com.querotv.app')
        .replace(/IPTVnator/g, 'QueroTV')
        .replace(/iptvnator/g, 'querotv');
    return next === base ? null : join(p.slice(0, p.length - base.length), next);
}

const files = [];
(function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const rel = relative(ROOT, full);
        if (statSync(full).isDirectory()) {
            if (SKIP_DIRS.has(entry)) continue;
            walk(full);
        } else {
            if (SKIP_FILES.has(entry) || SKIP_EXT.test(entry)) continue;
            if (KEEP_AS_IS.has(rel)) continue;
            files.push(full);
        }
    }
})(ROOT);

let changedFiles = 0;
let changedHits = 0;
const renames = [];

for (const file of files) {
    let text;
    try {
        text = readFileSync(file, 'utf8');
    } catch {
        continue;
    }
    if (!/iptvnator|com\.fourgray|4gray/i.test(text)) continue;
    let next = text;
    for (const [pattern, value] of REPLACEMENTS) next = next.replace(pattern, value);
    if (next === text) continue;
    const hits = (text.match(/iptvnator/gi) || []).length;
    changedFiles++;
    changedHits += hits;
    if (!CHECK) writeFileSync(file, next);
}

for (const file of files) {
    const next = targetPath(file);
    if (next && !existsSync(next)) {
        renames.push([relative(ROOT, file), relative(ROOT, next)]);
        if (!CHECK) renameSync(file, next);
    }
}

const verb = CHECK ? 'pending' : 'rewritten';
console.log(`QueroTV rebrand: ${changedFiles} files ${verb} (${changedHits} brand references)`);
for (const [from, to] of renames) console.log(`  rename: ${from} -> ${to}`);
if (CHECK && (changedFiles || renames.length)) process.exit(1);
