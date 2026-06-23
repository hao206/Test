UI Standardization Notes

- Centralized CSS variables: src/styles/variables.css
  - Use CSS vars `--accent`, `--bg`, `--text`, etc.
- Shared components added:
  - `src/components/Loader.tsx`
  - `src/components/EmptyState.tsx`

Next steps:
- Replace inline colors with CSS vars in key components (App, ProjectHub, Profile)
- Add responsive tweaks for mobile/tablet (use Tailwind or media queries)
- Add consistent button/card components consuming variables
