# Rule: Styling & Theming Integrity
1. NO INLINE STYLES: Never apply styling via JavaScript (e.g., `element.style.color`). All styling must be handled via CSS classes.
2. USE THEME VARIABLES: Never hardcode HEX or RGB colors in component CSS. Always use the project's predefined CSS variables (e.g., `--text-primary`, `--bg-surface`) to ensure automatic compatibility with Light/Dark modes.
3. VERIFY CONTRAST: When adding new UI elements, always ensure they are readable in both light and dark themes.
