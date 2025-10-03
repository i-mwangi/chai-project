# Design Document

## Overview

This design outlines the approach to modify the world.svg file to highlight only Kenya, Uganda, and Ethiopia while keeping other countries visible but subdued. The solution involves identifying the correct SVG path elements for these three East African countries and applying visual styling to differentiate them from the rest of the world map.

## Architecture

The solution follows a straightforward SVG manipulation approach:

1. **Path Identification**: Locate the SVG `<path>` elements that represent Kenya, Uganda, and Ethiopia
2. **Styling Application**: Apply CSS styling or inline styles to highlight these countries
3. **Background Treatment**: Ensure other countries remain visible but subdued

### SVG Structure Analysis

The world.svg file contains:
- SVG root element with viewBox dimensions (1440 x 885)
- Multiple path elements representing different countries
- Existing styling through fill attributes or CSS classes

## Components and Interfaces

### 1. SVG Path Elements

**Kenya, Uganda, and Ethiopia Paths**
- These paths need to be identified within the SVG structure
- Identification methods:
  - Manual inspection of path coordinates
  - Geographic position analysis (East Africa region)
  - Comparison with reference maps

**Other Country Paths**
- All remaining paths representing other countries
- Will receive subdued styling

### 2. Styling Approach

**Highlighted Countries Style**
```css
fill: #FF6B35 (or similar vibrant color)
stroke: #2C3E50 (dark border)
stroke-width: 1.5
opacity: 1
```

**Non-Highlighted Countries Style**
```css
fill: #E8E8E8 (light gray)
stroke: #CCCCCC (lighter border)
stroke-width: 0.5
opacity: 0.6
```

## Data Models

### SVG Path Structure
```xml
<path
  id="country-name"
  d="M x,y L x,y ..."
  fill="color"
  stroke="color"
  stroke-width="value"
/>
```

### Style Classes (Optional Approach)
```css
.highlighted-country {
  fill: #FF6B35;
  stroke: #2C3E50;
  stroke-width: 1.5;
}

.subdued-country {
  fill: #E8E8E8;
  stroke: #CCCCCC;
  stroke-width: 0.5;
  opacity: 0.6;
}
```

## Implementation Strategy

### Option 1: Inline Styles (Recommended)
Directly modify the fill and stroke attributes of the identified path elements. This approach is simpler and doesn't require CSS management.

### Option 2: CSS Classes
Add class attributes to paths and define styles in a `<style>` block within the SVG. This approach is more maintainable if frequent style changes are needed.

**Chosen Approach**: Option 1 (Inline Styles) for simplicity and immediate visual results.

## Path Identification Process

Since the SVG doesn't have labeled country IDs, we need to:

1. **Visual Inspection**: Open the SVG in a browser or editor
2. **Geographic Analysis**: Identify paths in the East Africa region (approximately):
   - Kenya: Located on the east coast, south of Ethiopia
   - Uganda: Landlocked, west of Kenya
   - Ethiopia: North of Kenya, landlocked
3. **Coordinate Analysis**: Examine path coordinates to match geographic positions
4. **Manual Testing**: Apply test colors to suspected paths and verify visually

## Error Handling

### Path Not Found
- If country paths cannot be identified, document the issue
- Provide alternative: manually mark paths with temporary IDs for identification

### SVG Corruption
- Validate SVG structure before and after modifications
- Keep backup of original file

### Browser Compatibility
- Ensure SVG renders correctly across modern browsers
- Test fill and stroke properties

## Testing Strategy

### Visual Testing
1. Open modified SVG in multiple browsers (Chrome, Firefox, Safari)
2. Verify Kenya, Uganda, and Ethiopia are highlighted
3. Confirm other countries are subdued but visible
4. Check borders and colors render correctly

### Validation Testing
1. Validate SVG syntax using online validators
2. Ensure no broken paths or malformed XML
3. Verify file size hasn't increased significantly

### Functional Testing
1. Confirm SVG loads without errors
2. Test in the context of the frontend application
3. Verify responsive behavior if applicable

## Technical Considerations

### Color Selection
- Use high-contrast colors for highlighted countries
- Ensure accessibility (color-blind friendly)
- Maintain visual harmony with subdued background

### Performance
- SVG file size should remain manageable
- No significant rendering performance impact
- Consider minification if file size is a concern

### Maintainability
- Document which paths correspond to which countries
- Use comments in SVG to mark modified sections
- Consider adding ID attributes for future reference

## Dependencies

- SVG editing capability (manual or programmatic)
- Text editor or SVG manipulation tool
- Browser for visual verification

## Deliverables

1. Modified world.svg file with highlighted East African countries
2. Documentation of path identifiers for Kenya, Uganda, and Ethiopia
3. Visual confirmation that requirements are met
