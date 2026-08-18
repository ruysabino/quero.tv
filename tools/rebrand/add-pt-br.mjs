#!/usr/bin/env node
/**
 * Adds a first-class Brazilian Portuguese locale ("ptbr") to QueroTV.
 *
 * Upstream already ships a complete European Portuguese translation ("pt"),
 * but there is no pt-BR variant, so Brazilian users get "ecrã", "telemóvel",
 * "carregar" style wording and pt-PT date/number formatting. This script
 * seeds `ptbr` from `pt`, applies BR wording, wires the enum, the supported
 * language list, the Angular locale registration and the date-locale alias.
 *
 * Idempotent: safe to run repeatedly.
 *   node tools/rebrand/add-pt-br.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const I18N = 'apps/web/src/assets/i18n';

/** pt-PT -> pt-BR wording, applied to string values only. */
const BR_TERMS = [
    [/\becrã\b/gi, 'tela'],
    [/\bEcrã\b/g, 'Tela'],
    [/\bficheiro/gi, 'arquivo'],
    [/\bFicheiro/g, 'Arquivo'],
    [/\bficheiros/gi, 'arquivos'],
    [/\baplicação\b/gi, 'aplicativo'],
    [/\bratinho\b/gi, 'mouse'],
    [/\bcarregar em\b/gi, 'clicar em'],
    [/\bpremir\b/gi, 'pressionar'],
    [/\bguardar\b/gi, 'salvar'],
    [/\bGuardar\b/g, 'Salvar'],
    [/\bapagar\b/gi, 'excluir'],
    [/\bApagar\b/g, 'Excluir'],
    [/\bcanal de televisão\b/gi, 'canal de TV'],
    [/\butilizador/gi, 'usuário'],
    [/\bUtilizador/g, 'Usuário'],
    [/\butilizadores/gi, 'usuários'],
    [/\bpalavra-passe\b/gi, 'senha'],
    [/\bPalavra-passe\b/g, 'Senha'],
    [/\bendereço eletrónico\b/gi, 'e-mail'],
    [/\beletrónic/gi, 'eletrônic'],
    [/\bcontacto/gi, 'contato'],
    [/\bcontactos/gi, 'contatos'],
    [/\bdefinições\b/gi, 'configurações'],
    [/\bDefinições\b/g, 'Configurações'],
    [/\btransferência\b/gi, 'download'],
    [/\btransferir\b/gi, 'baixar'],
    [/\bTransferir\b/g, 'Baixar'],
    [/\bcancelar a subscrição\b/gi, 'cancelar a inscrição'],
];

function brify(value) {
    if (typeof value !== 'string') return value;
    let out = value;
    for (const [from, to] of BR_TERMS) out = out.replace(from, to);
    return out;
}

function walk(node) {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
        return Object.fromEntries(
            Object.entries(node).map(([k, v]) => [k, walk(v)])
        );
    }
    return brify(node);
}

// 1. ptbr.json seeded from pt.json
const pt = JSON.parse(readFileSync(`${I18N}/pt.json`, 'utf8'));
const ptbr = walk(pt);
writeFileSync(`${I18N}/ptbr.json`, JSON.stringify(ptbr, null, 4) + '\n');

// 2. LANGUAGES.PORTUGUESE_BR label in every locale file
for (const file of ['ar','ary','by','de','el','en','es','fr','hu','it','ja','ko','nl','pl','pt','ptbr','ru','tr','zh','zhtw']) {
    const path = `${I18N}/${file}.json`;
    if (!existsSync(path)) continue;
    const data = JSON.parse(readFileSync(path, 'utf8'));
    if (data.LANGUAGES && !data.LANGUAGES.PORTUGUESE_BR) {
        const next = {};
        for (const [k, v] of Object.entries(data.LANGUAGES)) {
            next[k] = v;
            if (k === 'PORTUGUESE') next.PORTUGUESE_BR = 'Português (Brasil)';
        }
        data.LANGUAGES = next;
        writeFileSync(path, JSON.stringify(data, null, 4) + '\n');
    }
}

// 3. Language enum
const enumPath = 'libs/shared/interfaces/src/lib/language.enum.ts';
let enumSrc = readFileSync(enumPath, 'utf8');
if (!enumSrc.includes('PORTUGUESE_BR')) {
    enumSrc = enumSrc.replace(
        /(\s+)PORTUGUESE = 'pt',/,
        `$1PORTUGUESE = 'pt',$1PORTUGUESE_BR = 'ptbr',`
    );
    writeFileSync(enumPath, enumSrc);
}

// 4. Supported languages used by the boot-time language hint
const configPath = 'apps/web/src/app/app.config.ts';
let configSrc = readFileSync(configPath, 'utf8');
if (!configSrc.includes("'ptbr'")) {
    configSrc = configSrc.replace(/(\n\s+)'pt',/, `$1'pt',$1'ptbr',`);
    writeFileSync(configPath, configSrc);
}

// 5. Angular locale registration
const localesPath = 'apps/web/src/app/app-date-locales.ts';
let localesSrc = readFileSync(localesPath, 'utf8');
if (!localesSrc.includes('localePtBr')) {
    localesSrc = localesSrc
        .replace(
            "import localePt from '@angular/common/locales/pt';",
            "import localePt from '@angular/common/locales/pt';\nimport localePtBr from '@angular/common/locales/pt-BR';"
        )
        .replace(
            "registerLocaleData(localePt, 'pt');",
            "registerLocaleData(localePt, 'pt');\n    registerLocaleData(localePtBr, 'pt-BR');"
        );
    writeFileSync(localesPath, localesSrc);
}

// 6. Date locale alias ptbr -> pt-BR
const datePath = 'libs/ui/pipes/src/lib/date-format.util.ts';
let dateSrc = readFileSync(datePath, 'utf8');
if (!dateSrc.includes("ptbr:")) {
    dateSrc = dateSrc.replace(
        /(const DATE_LOCALE_ALIASES: Record<string, string> = \{\n)/,
        `$1    ptbr: 'pt-BR',\n`
    );
    writeFileSync(datePath, dateSrc);
}

console.log('pt-BR locale wired: ptbr.json + enum + supported langs + date locale');
