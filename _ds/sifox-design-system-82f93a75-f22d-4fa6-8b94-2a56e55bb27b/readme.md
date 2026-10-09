# Sifox Design System

Sifox is a fintech / banking-technology brand. The attached Figma file ("UI.fig") is Sifox's brand + presentation kit: it defines the color palette, the Druk LCG Wide + Nunito type pairing, a bank-card design system (Card / Classic with faces, textures, payment marks and embossed text), and three slide layout families — covers ("Обложки"), schemes ("Схемы") and info blocks ("Блоки с инфо") — used to present Copula, Sifox's omnichannel conversational-AI platform for banks (first platform with Uzbek-language support). Content in the source is written in Russian.

**Sources**
- Figma file: "UI.fig" (attached; pages: Color Palette, text, обложки, блок схемы, блоки с инфо)
- Uploaded fonts: Druk Wide Cyr (ttf/woff), DrukWide-Medium-Trial (otf), Nunito (variable), Nunito Sans (unused by the file)
- Uploaded logo: Sifox_logo 2.svg (dark wordmark, 103×32)

## CONTENT FUNDAMENTALS
- Language: Russian (the platform itself supports Uzbek; UI copy in the kit is Russian). Currency examples in UZS.
- Tone: direct, benefit-led B2B copy addressed to banks. "Мы предоставляем SDK…", "Храните все о своих клиентах в одном месте".
- Structure: Druk heading (short noun phrase) + Nunito explainer sentence. Case slides use labeled sections: "Задача:", "Результат:", "Триггер:", "Кейс 8".
- Lists are plain "•" bullets inside a single text block, one clause per line, sentence case, period at end.
- No emoji. Numbers formatted with thin spaces: "1 000 000 UZS", "+35% годовых".
- Headings are sentence case (not ALL CAPS), even in Druk.

## VISUAL FOUNDATIONS
- **Color**: electric blue #373BF9 is the accent; supporting periwinkles #697DFF/#A5BDFF/#B9D1FF; pink #FF87CE as the single warm accent. Pages are white; info blocks sit on pale blue #E8EFFF; chat/message surfaces on #D1E1FF. Text: #323030 primary, #74748F secondary, #9292AD tertiary, #C6CADD borders.
- **Gradients**: signature blue gradient #92AEFF → #373BF9 (143.5°) on icon tiles and covers; covers use a large radial version; neutral slides use a barely-there gray wash (#E3E3E3 → #FAFAFA under white).
- **Type**: Druk LCG Wide (500, occasionally 700) for all display/headings, 100% line-height, +2% tracking on slide titles, +5% on spec titles. Nunito for everything else (400 body 24/28, 500–600 UI, 700–800 emphasis). Nunito 500 64/72 is the secondary "subtitle" style.
- **Corners**: slide info blocks are SQUARE (radius 0 — explicit rule in the file: "Блоки с инфо без скруглений"); scheme blocks may round. Cards inside schemes: 12px; chips 8px; gradient icon tiles 11.25–27px; the bank card 40px (22px at small scale).
- **Shadows**: floating cards 0 4px 10.7px rgba(57,60,75,.3); icon tiles 0 7.5px 20.06px rgba(57,60,75,.3); soft halo 0 0 16px rgba(57,60,75,.1) + 0 10px 16px rgba(57,60,75,.05); bank card uses inner emboss (inset -2 -2 4 rgba(0,0,0,.04) + inset 0 4 4 rgba(255,255,255,.15)).
- **Borders**: 0.74px hairline rgba(127,130,145,.5) on secondary cards; 1.5px solid #373BF9 connectors/outlines in schemes; thin 0.5px black guides in slide margins.
- **Imagery**: real photography of people, good quality, non-white backgrounds (explicit rule in the file). Full-color, warm. Cut-out PNGs of people/buildings overlap slide blocks. Blurred bank-card renders float on covers.
- **Backgrounds**: covers are full-bleed blue radial gradient with dark/blue ellipse blobs and floating cards; slides are white or near-white gray wash.
- **Layout**: 1660×900-ish slide canvas with ~62px side insets; thin vertical rule guides; date bottom-right in #B9D1FF on covers; sifox wordmark small top-left (white on covers).
- **Transparency/blur**: frosted panels — linear-gradient rgba(225,235,255,.4)→rgba(116,116,143,.4) + backdrop-blur 14.4px — inside scheme cases.
- **Animation**: none defined in the file; keep motion minimal (simple fades) if needed.
- **Hover/press**: not defined (presentation kit); if needed, use accent-3 #697DFF as hover shift.

## ICONOGRAPHY
- No icon font. Icons are white stroke/fill glyphs on the blue-gradient rounded tile (64px, radius 11.25, icon shadow) — channel icons: call, messenger, SMS, mail, app. Brand-colored tiles allowed for third parties (tg = light blue, WhatsApp = green — rule stated in the file).
- Extracted SVGs live in `assets/icons/` (messenger, mail, storage, shop, calling, virtual-agent, agent-badge) plus `assets/images/call-icon.png`. iOS-style red notification badge (#FF3B30, SF Pro) appears once in a mock.
- No emoji, no unicode-as-icon. If more icons are needed, match a rounded, chunky white style (e.g. Iconify sets "mage"/"weui" seen in layer names) — flag any substitution.
- **Logo**: dark #323030 "sifox" wordmark (assets/Sifox_logo.svg). White version = same SVG with filter: brightness(0) invert(1). Components LogoDark/LogoLight are the card-face marks.

## Components (23 — full Figma inventory)
CardClassic, Images00, Images02, Images03, Images04, Images05, Images07, LogoDark, LogoLight, PaymentMastercardColor, PaymentMastercardGrayscale, PaymentMastercardSolidLight, PaymentMastercardStrokeMetal, PaypassSolid, TextDateStandartDark, TextNameStandartDark, TextNumEmbossedStandart, TextNumShortStandart, TextNumSolidStandart, TextureIridescent, TextureMetal, TextureNoise, TexturePaper.

All are bank-card subsystem parts: CardClassic composes a face (Images*), logo, texture, number/name/date text, Paypass and a Mastercard mark. Intentional additions: none.

## Index
- `styles.css` — global entry (imports everything below)
- `tokens/` — fonts.css, colors.css, typography.css, effects.css, base.css
- `components/` — 23 React components + fig-tokens.css / fig-assets.css + component cards
- `assets/` — Sifox_logo.svg, fonts/, icons/, images/ (photography from the file)
- `guidelines/` — foundation specimen cards (Design System tab)
- `slides/` — sample slide layouts (cover, info block, scheme, case)
- `SKILL.md` — agent skill entry point

## Caveats
- Texture / Iridescent and Texture / Metal bitmaps exceeded the extraction budget (>4 MB) — components render without their photo fill.
- Druk Wide Cyr files are unlabeled weight; they serve weights 400–700 of "Druk LCG". DrukWide-Medium-Trial.otf (Latin-only trial) is kept in assets/fonts as an alternate.
- Raleway (4 uses) and SF Pro (1 use, iOS badge mock) are incidental in mocks — not tokenized; system fallbacks used.
- Nunito Sans was uploaded but the Figma file only uses Nunito.
