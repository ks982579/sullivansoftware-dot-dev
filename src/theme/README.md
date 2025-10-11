# Japanese Retro Theme

## Design Concept
Inspired by 1980s Japanese consumer electronics (Sony Walkman era), vintage Tokyo aesthetics, and retro futurism. Clean, minimal, warm, and nostalgic.

## Color Palette

### Primary Colors
- **Primary**: `#8B4513` (Saddle Brown) - Vintage leather/wood tones
- **Primary Light**: `#C19A6B` (Tan)
- **Primary Dark**: `#5C2E0A` (Deep Brown)

### Secondary Colors
- **Secondary**: `#2F4F4F` (Dark Slate Gray) - Vintage electronics
- **Secondary Light**: `#527F7F`
- **Secondary Dark**: `#1C3030` (Deep Forest)

### Accent Colors
- **Orange**: `#FF6F00` (Burnt Orange) - Retro warm accent
- **Blue**: `#0288D1` (Retro Tech Blue)
- **Green**: `#388E3C` (Forest Green)

### Background Colors
- **Background**: `#FFF8DC` (Cornsilk) - Warm vintage paper
- **Paper**: `#FFFAF0` (Floral White) - Slightly warmer white

### Text Colors
- **Primary Text**: `#2C1810` (Very Dark Brown - almost black)
- **Secondary Text**: `#5C4033` (Medium Brown)

## Typography
- **Font Family**: Inter (clean, modern, geometric)
- **Headings**: Bold, tight letter-spacing for impact
- **Body**: 1.7 line-height for readability

## Usage

### With Material UI
```tsx
import { Button } from '@mui/material';

<Button variant="contained" color="primary">
  Click Me
</Button>
```

### With Tailwind
```tsx
<div className="bg-primary text-white">
  <h1 className="text-primary">Hello</h1>
  <p className="text-text-secondary">Description</p>
</div>
```

## Design Principles
1. **Warmth**: Use warm tones (browns, tans, oranges)
2. **Simplicity**: Clean layouts, minimal decoration
3. **Nostalgia**: Subtle retro touches without being kitsch
4. **Readability**: High contrast, generous spacing
5. **Consistency**: Same colors across MUI and Tailwind
