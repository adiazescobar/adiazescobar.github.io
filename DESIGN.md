# Design System — adiazescobar.com

## Product Context
- **What this is:** Sitio personal académico de Ana María Díaz Escobar (CV, publicaciones, libros de texto, presentaciones, videos).
- **Who it's for:** Colegas académicos, estudiantes, editores de revistas, prensa.
- **Space/industry:** Economía académica (economía laboral, género, experimentos de campo).
- **Project type:** Sitio editorial / portafolio personal estático (HTML/CSS/JS vanilla, GitHub Pages).

## Aesthetic Direction
- **Direction:** "Mono claro" — técnica/editorial de precisión (vibe de investigadora, tipo ficha de estudio de diseño).
- **Decoration level:** intentional — marco fino con marcas de registro "+" en las esquinas, línea de metadatos monoespaciada. Nada de iconos en círculos ni tarjetas.
- **Mood:** Precisa, seria, contemporánea. Se siente diseñada a mano, no generada por plantilla.
- **Reference sites:** rajchetty.com (minimal académico), emilyoster.net (editorial cálido). Deliberadamente más técnica y menos "crema + serif" que ambas.

## Typography
- **Display (home "Field Note"):** Fraunces (serif de alto contraste, óptico) — SOLO para el nombre, el eyebrow, los títulos del índice y el monograma. Le da voz editorial/literaria. Itálica para "Escobar", eyebrow y monograma.
- **Display/Hero (páginas internas):** Hanken Grotesk 600 — grotesca humanista con carácter.
- **Body:** Hanken Grotesk 400 — misma familia, coherente.
- **UI/Labels/Nav/Meta:** JetBrains Mono 500 — monoespaciada; da la precisión técnica de econometrista.
- **Loading:** Google Fonts vía `<link>` (Hanken Grotesk + JetBrains Mono).
- **Scale:** hero clamp(2.5rem, 6vw, 4.6rem)/600; títulos índice 1.4rem/600; body 17px/1.6; labels .7rem mono uppercase, letter-spacing .1em.

## Color
- **Approach:** restrained — neutros + un solo acento terracota, usado con moderación.
- **Paper (bg):** `#FCFCFB` — blanco cálido, no clínico.
- **Surface:** `#FFFFFF`.
- **Ink (texto):** `#17181A` — casi negro.
- **Muted:** `#6A6C70`.
- **Line:** `#E7E7E3` (hairlines). **Frame:** `#DADAD4` (borde del marco).
- **Accent (terracota):** `#C0562F` — números de índice, "Escobar", hovers, marcas de registro.
- **Dark mode:** no implementado (posible variante "Oscura ámbar" futura).

## Spacing
- **Base unit:** 8px.
- **Density:** comfortable/spacious (mucho aire).
- **Frame padding:** 2.6rem 3rem (desktop) / 1.8rem 1.4rem (móvil).

## Layout
- **Approach:** creative-editorial + grid-disciplined — hero asimétrico (nombre 1.55fr / bio 1fr), contenido dentro de un marco centrado.
- **Max content width:** 1000px (marco).
- **Border radius:** 0 (esquinas rectas; el lenguaje es de ficha/plano técnico).
- **Resources:** índice numerado (01–06), no mosaico de tarjetas.

## Motion
- **Approach:** minimal-functional.
- **Hover:** filas del índice desplazan `padding-left` .5rem y revelan la flecha (.18s ease); links cambian a terracota.
- **Duration:** micro/short 150–200ms.

## Implementation notes
- `index.html` es self-contained (estilos en `<style>`), independiente de `style.css`.
- **Migración completa (2026-07-14):** `index.html`, `publications.html`, `videos.html`, `presentaciones/index.html` y el CV (repo aparte) están todos en el sistema "Mono claro / Field Note". Ya no dependen del `style.css` anterior. `style.css` eliminado el 2026-07-14 (ninguna página lo usaba).

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-30 | Sistema de diseño inicial "Mono claro" creado por /design-consultation | Rediseño desde look genérico de tarjetas azules; elegido tras comparar direcciones editorial/grotesca/técnica/oscura. Terracota como acento. |
| 2026-07-01 | Home elevado a concepto "Field Note" | El home se sentía genérico/simple. Se agregó Fraunces (display), eyebrow+tagline, riel "Trabajo actual" (R&R/RCTs), vertebra terracota, textura de papel, footer con monograma. Tras dos agentes de diseño (typografía + arte). |
| 2026-07-10 | `publications.html` migrada a "Mono claro" + capa de motion | Se consolidaron 3 bloques de overrides con `!important` en una sola hoja idéntica al home (marco + marcas `+`, masthead/nav con hover de subrayado, hero Fraunces, footer con monograma); se eliminó el dark mode ámbar fuera de sistema. Interfaz en inglés (papers y audiencia internacional; el home sigue en español). Motion con criterio: reveal escalonado en carga + scroll, hover de fila con flecha terracota, feedback de pulsación, filtro con FLIP — todo bajo `prefers-reduced-motion`. Paper JDEff (WTP remote/hybrid, 2026) subido al inicio con título enlazado al DOI. Skills: impeccable + design-motion-principles. |
| 2026-07-14 | Home a inglés · `style.css` eliminado · fix PDF del CV | Home (`index.html`) traducido a inglés (portada para audiencia internacional; videos/presentaciones siguen en español por ser docencia). `style.css` huérfano borrado. CV: el botón "Download PDF" (`window.print()`) sacaba huecos horribles porque las secciones sin reveal salían en `opacity:0` — se agregó `@media print` que fuerza `.reveal` visible, colapsa a una columna, oculta rail/nav/toolbar y quita la textura de papel (PDF pasó de 18MB a 447KB). Verificado generando el PDF con Chrome headless. |
| 2026-07-14 | `videos.html` + `presentaciones/index.html` migradas a Field Note | Ambas dependían del `style.css` viejo + overrides `!important`; consolidadas a una hoja limpia por página. Videos (contenido docente, se mantiene en español): la grilla plana aburría, así que se agrupó por categoría con labels mono (MÉTODOS/GÉNERO/…), se quitaron los 40 chips terracota redundantes, reveal escalonado por tarjeta, eyebrow con conteo que se actualiza al filtrar, hover con título+anillo terracota. Presentaciones: lista editorial con títulos Fraunces (subrayado que crece + flecha en hover). Revisión estética por subagente antes de aplicar. Skills: impeccable + design-motion-principles. |
| 2026-07-10 | CV (`ana-maria-diaz-cv/index.html`, repo aparte) rediseñado por densidad | Complaint: "mucha info, difícil de seguir, poco design-oriented". Se convirtieron las 14 cards en secciones editoriales (label mono + hairline), rail izquierdo pegajoso con índice numerado de secciones (scrollspy), toolbar jerarquizada (un primario al final), títulos de listas del cuerpo a Fraunces, misma capa de motion. CV se mantiene completo (norma académica). Dark mode eliminado por consistencia. Revisión estética por subagente (general-purpose + agent-browser): detectó y se corrigieron 2 bugs (grid móvil no colapsaba, scrollspy marcaba sección equivocada arriba) + hueco hero móvil. Skills: impeccable + design-motion-principles. |
