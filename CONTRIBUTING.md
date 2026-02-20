# Contributing to MapLeads

Thank you for your interest in contributing to MapLeads! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

### Suggesting Features

We welcome feature suggestions! Please:
- Check if the feature was already suggested
- Describe the feature and its use case
- Explain why it would be valuable

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**
   - Ensure the app runs without errors
   - Test all affected features
5. **Commit your changes**
   ```bash
   git commit -m "Add: feature description"
   ```
   Use conventional commits:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**
   - Describe what you changed and why
   - Link any related issues
   - Request review

## Development Guidelines

### Code Style

- Use functional components and hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Keep components small and focused
- Extract reusable logic into hooks

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and external services
└── stores/        # State management
```

### Naming Conventions

- **Components**: PascalCase (e.g., `BusinessCard.jsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useBusinessSearch.js`)
- **Utilities**: camelCase (e.g., `formatDistance.js`)
- **Constants**: UPPER_SNAKE_CASE

### Testing

Before submitting:
- [ ] App builds without errors (`npm run build`)
- [ ] No console errors or warnings
- [ ] All features work as expected
- [ ] Code is formatted properly

## Questions?

Feel free to ask questions by creating an issue or reaching out to maintainers.

Thank you for contributing! 🙏
