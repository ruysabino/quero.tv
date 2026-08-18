# Análise legal e técnica — fork `ruysabino/iptvnator.br` → **QueroTV**

Data: 18/08/2026 · Base analisada: `master` (fork de `4gray/iptvnator`, v0.23.0, MIT)

## Resumo

| # | Achado | Gravidade | Situação |
| --- | --- | --- | --- |
| 1 | Nome do fork viola a política de marca do upstream | **Crítico** | Corrigido (QueroTV) |
| 2 | Logo/ícone do IPTVnator reutilizados como identidade do fork | **Crítico** | Corrigido (ícones novos) |
| 3 | Feed de auto-atualização aponta para releases do upstream | **Crítico** | Corrigido |
| 4 | `appId` `com.fourgray.iptvnator` (identidade de terceiro) | Alto | Corrigido |
| 5 | Aviso de copyright do LICENSE sem autoria e sem ano correto | Alto | Corrigido |
| 6 | Ausência de NOTICE com licenças de terceiros (Apache-2.0/LGPL) | Alto | Corrigido |
| 7 | Obrigações LGPL do runtime mpv/FFmpeg embarcado | Alto | Documentado |
| 8 | Logo do Twitter/X embarcado como asset | Médio | Apontado |
| 9 | Motivação do fork (PT) já é atendida pelo upstream | Informativo | Explicado |
| 10 | Sem chaves de API expostas, sem telemetria | OK | Verificado |

---

## 1-2. Marca: o nome `iptvnator.br` e o logo não podem ficar

O upstream publica um `TRADEMARK.md` explícito. Ele libera o **código** (MIT),
mas **não** a marca, e proíbe nominalmente:

> Use the name "IPTVnator" (or any confusingly similar variant such as
> "IPTV-Nator", "IPTVNator", "IPTV Nator", etc.) as the name of your fork…
> Use the IPTVnator logo, icon, or artwork to identify your fork.

`iptvnator.br` é exatamente uma variante confusamente semelhante — é o caso
mais direto de violação previsto no texto. O repositório também reutiliza todo
o conjunto de ícones (`apps/web/src/assets/icons/*`), que é a arte de marca do
projeto original.

**Correção aplicada:** rebranding completo para **QueroTV**, com ícone próprio
gerado do zero (nenhum arquivo de arte do upstream é reaproveitado). O que
permanece é apenas a referência nominativa factual — "QueroTV é um fork do
IPTVnator" — que o próprio upstream declara aceitável.

**Ação manual necessária:** renomear o repositório no GitHub de
`iptvnator.br` para `querotv` (Settings → Repository name). Enquanto o nome do
repo estiver como está, a violação continua visível na URL.

## 3. Auto-atualização apontando para o upstream (o risco mais perigoso)

`electron-builder.json` traz:

```json
"publish": [{ "provider": "github", "owner": "4gray", "repo": "iptvnator" }]
```

Com `electron-updater` ativo no `main.ts`, qualquer build do fork distribuído
baixaria e instalaria **os binários oficiais do IPTVnator** por cima do seu
app. Isso é, ao mesmo tempo, quebra funcional, consumo indevido da
infraestrutura de releases de terceiro e um caminho para o usuário achar que
os dois produtos são o mesmo. Corrigido para `ruysabino/quero.tv`.

## 4. Identidade de bundle

`com.fourgray.iptvnator` (appId, metainfo AppStream, Flatpak, snap,
`StartupWMClass`, chave de storage `iptvnator:preferred-language`) foi
substituído por `br.com.querotv.app` / `querotv:`. Sem isso, o app instalaria
no mesmo espaço do IPTVnator oficial e disputaria associação de arquivos
`.m3u`.

## 5. LICENSE

O arquivo original diz apenas `Copyright 2020-2021`, sem titular — o que é
tecnicamente um aviso de copyright inválido para efeito da própria cláusula
MIT ("the above copyright notice … shall be included"). O novo `LICENSE.md`
mantém o crédito do upstream e acrescenta o do fork, como manda a MIT.

## 6. Dependências e compatibilidade de licenças

Todas as dependências diretas de runtime são permissivas e **compatíveis** com
a redistribuição sob MIT: Angular/NgRx/Electron/better-sqlite3/artplayer/
drizzle (MIT), video.js/hls.js/mpegts.js/shaka-player (Apache-2.0), saxes/
epg-parser (ISC/MIT). Nenhum componente copyleft entra no bundle JavaScript.

Ponto de atenção formal: Apache-2.0 exige preservar o texto da licença e os
arquivos NOTICE nas redistribuições — por isso o `NOTICE.md` novo lista os
componentes e o build precisa continuar publicando `resources/licenses/`.

## 7. Runtime mpv/FFmpeg embarcado — obrigação LGPL

`tools/embedded-mpv/` compila e embarca mpv 0.41, FFmpeg 8.1, libplacebo,
libass, FreeType, HarfBuzz, FriBidi e OpenSSL. A configuração do upstream é
correta e cuidadosa: `--disable-gpl --disable-nonfree` e `-Dgpl=false`, ou
seja, **LGPL, não GPL** — o app MIT pode ser distribuído junto.

Mas a LGPL continua exigindo, para cada binário publicado:

1. a oferta do **código-fonte correspondente** das bibliotecas LGPL, e
2. a possibilidade de o usuário **relincar** contra uma versão modificada.

O upstream já produz esses artefatos (snapshot de fontes pinado, manifesto
`license-inputs`, `release-snap-source-binding.cjs`). **Quem publicar releases
do QueroTV precisa publicar esses artefatos junto com os binários.** Se o
pipeline de release for simplificado e essa etapa cair, o fork passa a
distribuir LGPL sem fonte — aí sim há infração real. Está documentado no
`NOTICE.md`.

Já VLC e mpv instalados pelo sistema são apenas *executados* como processo
externo: não gera obra derivada e não contamina a licença.

## 8. Logo do Twitter/X

`apps/web/src/assets/icons/twitter-light.png` (1034×851) é a marca do X/Twitter.
As diretrizes da X Corp restringem o uso do logo fora de contexto de
compartilhamento. Recomendo trocar por um ícone genérico do Material Symbols
(já disponível no projeto) ou remover o link. O `github-light.png` (32×32) em
link para o repositório está dentro do uso aceito pelas diretrizes do GitHub.

## 9. Sobre o motivo do fork: o português já existe

O upstream **já tem tradução completa de português** —
`apps/web/src/assets/i18n/pt.json`, 1432 chaves, 0 faltando (apenas 73 termos
idênticos ao inglês, como "Volume" e nomes de players). A troca fica em
Configurações → Geral → Idioma, e o app grava a escolha em
`localStorage` (`iptvnator:preferred-language`). Ou seja: a versão desktop
tem, sim, seletor de idioma; ele pode não ter sido encontrado.

O que **não** existia é o **pt-BR**: o `pt.json` é português europeu ("ecrã",
"ficheiro", "guardar", "definições", "utilizador"), e a formatação de datas
usa locale `pt-PT`. Isso é uma diferença real para o público brasileiro.

**Correção aplicada:** locale `ptbr` de primeira classe — novo `ptbr.json`
derivado do `pt.json` com vocabulário brasileiro, entrada `PORTUGUESE_BR` no
enum de idiomas e nos 20 arquivos de tradução, registro de `pt-BR` no Angular
e alias de formatação de data. O pt-PT continua disponível.

## 10. Segurança e privacidade — sem achados

- Nenhuma chave de API, token ou credencial hardcoded no código do app.
- Nenhuma telemetria, analytics, Sentry ou beacon de terceiros.
- Nenhuma fonte remota carregada de CDN no app Electron.
- O app não distribui listas, portais ou conteúdo; o usuário fornece as fontes
  (registrado no disclaimer do `NOTICE.md`, útil como defesa).

---

## O que ainda depende de você

1. Renomear o repositório para `querotv` no GitHub e ajustar a descrição para
   algo como *"Player IPTV multiplataforma em português — fork do IPTVnator"*.
2. Rodar `node tools/rebrand/querotv-rebrand.mjs` no clone local, commitar e,
   depois, `pnpm install && pnpm build` para validar o build completo (o
   rebranding altera os aliases `@iptvnator/*` → `@querotv/*` em 1330
   arquivos; a substituição é mecânica e idempotente, verificável com
   `--check`).
3. Substituir as capturas de tela da raiz (`iptv-*.png`, `playlists.png`) por
   screenshots do QueroTV — as atuais mostram a marca do upstream.
4. Manter os artefatos de conformidade LGPL em todo release.
5. Opcional: `git remote add upstream https://github.com/4gray/iptvnator.git`
   para continuar acompanhando as correções do projeto original.
