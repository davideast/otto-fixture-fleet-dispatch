---
name: Atelier Studio
---

## Overview

A functionalist, reductive studio interface prioritizing spatial clarity, physical materiality, and typographic hierarchy. Visual noise is stripped away so the user focuses entirely on the domain's primary artifact and core interactions. Every element is deliberate, unadorned, and essential.

## Colors

A high-legibility material foundation accented by a single tactile signal hue.

- **Neutral** {colors.neutral} is warm architectural paper — providing expansive negative space and soft optical contrast.
- **Primary** {colors.primary} is deep carbon ink — anchoring typography, active states, and structural text blocks.
- **Secondary** {colors.secondary} is muted pencil gray — used for secondary metadata, inactive controls, and hairline rules.
- **Tertiary** {colors.tertiary} is signal ochre — a focused, single-point accent reserved for active states.

```yaml
colors:
  neutral: "#FAFAFA"
  primary: "#18181B"
  secondary: "#71717A"
  tertiary: "#D97706"
```

## Typography

Strict typographic hierarchy employing the clarity of Plus Jakarta Sans for reading and the tabular precision of JetBrains Mono for metrics.

```yaml
typography:
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: 500
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 400
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 400
```

## Layout

A restrained desktop composition (min 1440px) structured along clean hairline divisions and generous negative space (>50% open canvas).

```yaml
spacing:
  base: 16px
  sm: 8px
  md: 16px
  lg: 32px
```

## Shapes

Precise, subtle micro-radii that soften geometric forms without decorative excess.

```yaml
rounded:
  sm: 2px
  md: 4px
  lg: 6px
```

## Do's and Don'ts

- Do embrace whitespace and typographic rhythm as primary organizing principles.
- Do use hairline borders (1px) and muted tones to divide functional regions.
- Don't use saturated neon glows, colorful gradients, or heavy decorative shadows.
- Don't introduce unnecessary icons, status pills, or embellishments when pure typography suffices.
