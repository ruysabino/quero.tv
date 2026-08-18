# NOTICE — QueroTV

QueroTV is an independent fork of **IPTVnator**
(<https://github.com/4gray/iptvnator>), created and maintained by
Ruy Sabino Pereira. QueroTV is **not** affiliated with, endorsed by, or
supported by the IPTVnator project or its author (4gray).

The QueroTV name, icon and artwork are the identity of this fork only.
The "IPTVnator" name and the IPTVnator logo remain trademarks of the
IPTVnator project owner and are used here **only** in a nominative,
factual sense ("QueroTV is a fork of IPTVnator"), as expressly permitted
by the upstream trademark notice.

## Upstream code

    IPTVnator
    Copyright (c) 2020-2026 4gray and IPTVnator contributors
    Licensed under the MIT License — see LICENSE.md

    QueroTV modifications
    Copyright (c) 2026 Ruy Sabino Pereira
    Licensed under the MIT License — see LICENSE.md

## Third-party components

| Component | License | Notes |
| --- | --- | --- |
| Angular, Angular CDK/Material | MIT | Google LLC |
| NgRx (`@ngrx/*`) | MIT | |
| RxJS, zone.js | Apache-2.0 / MIT | |
| Electron, electron-updater, electron-conf | MIT | |
| better-sqlite3, drizzle-orm | MIT | |
| video.js, videojs-contrib-quality-levels | Apache-2.0 | |
| hls.js, mpegts.js | Apache-2.0 | |
| shaka-player | Apache-2.0 | Google LLC |
| artplayer | MIT | |
| iptv-playlist-parser, epg-parser, saxes, date-fns, marked, axios | MIT / ISC | |
| angularx-qrcode, ngx-indexed-db, ngx-skeleton-loader, `@ngx-pwa/local-storage` | MIT | |

All of the above are permissive (MIT / Apache-2.0 / ISC) and are compatible
with distributing QueroTV under the MIT License. Apache-2.0 components
require that their license text and any NOTICE files are preserved in
redistributions; the packaged builds ship them under
`resources/licenses/`.

## Embedded multimedia runtime (mpv / FFmpeg)

Desktop builds may embed an mpv-based playback runtime. That runtime is
built **without** `--enable-gpl` and **without** `--enable-nonfree`, i.e.
in an LGPL-compatible configuration, and it is dynamically linked. This
matters legally:

- The LGPL requires that the corresponding **source code** of the LGPL
  components (FFmpeg, libplacebo, libmpv and their dependencies) is
  offered to every recipient of a binary, together with the ability to
  relink against a modified version of those libraries.
- The upstream build tooling produces a pinned source snapshot and a
  license-input manifest for exactly this purpose
  (`tools/embedded-mpv/`, `tools/packaging/release-snap-source-binding.cjs`).
- **Anyone publishing QueroTV binaries must publish those source
  snapshots and license manifests alongside the binaries.** Do not strip
  that step from the release workflow.

Third-party runtime components and their licenses:

| Component | License |
| --- | --- |
| mpv / libmpv | LGPL-2.1-or-later (built with `-Dgpl=false`) |
| FFmpeg | LGPL-2.1-or-later (built with `--disable-gpl --disable-nonfree`) |
| libplacebo | LGPL-2.1-or-later |
| libass | ISC |
| FreeType | FTL / GPL-2.0 dual — FTL applies here |
| HarfBuzz | MIT (Old) |
| fontconfig, expat, hwdata, libdisplay-info | MIT-style |
| FriBidi | LGPL-2.1-or-later |
| OpenSSL 3.x | Apache-2.0 |

VLC and system-installed mpv are **not** bundled: QueroTV only launches an
external player binary that the user already installed. Invoking a separate
program does not create a derivative work, so no GPL obligation is
triggered by that integration.

## Content disclaimer

QueroTV is a player. It ships **no** channel lists, playlists, portals or
media content, and it provides no way to discover them. The user supplies
their own M3U/Xtream/Stalker sources and is solely responsible for holding
the rights to the content they access.
