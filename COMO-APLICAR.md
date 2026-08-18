# Kit de rebranding QueroTV — como aplicar

Repositório alvo: https://github.com/ruysabino/quero.tv

1. Clone o fork e copie o conteúdo deste kit para a raiz do projeto:
   - `tools/rebrand/` (scripts)
   - `LICENSE.md`, `NOTICE.md`, `TRADEMARK.md`
   - `assets/icons/` (ícones novos)
2. Rode o rebranding:
   ```bash
   node tools/rebrand/querotv-rebrand.mjs          # aplica
   node tools/rebrand/querotv-rebrand.mjs --check  # verifica pendências
   node tools/rebrand/add-pt-br.mjs                # adiciona locale pt-BR
   ```
3. Substitua os ícones do app pelos de `assets/icons/`
   (`apps/web/src/assets/icons/`, `favicon.ico`, `favicon.icns`, PNGs).
4. `pnpm install && pnpm build` e teste o electron.

O script preserva as refs reais do `iptv-playlist-parser` (dependência git do upstream)
e reescreve owner/repo do electron-updater para `ruysabino/quero.tv`.
