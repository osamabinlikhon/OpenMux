# Contributing to OpenMux

We welcome contributions to OpenMux! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/OpenMux.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Set up development environment: `./scripts/install.sh`
5. Make your changes
6. Commit and push to your fork
7. Create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install --workspaces

# Start development
./scripts/dev.sh

# Run tests
npm test --workspaces

# Build
npm run build --workspaces
```

## Code Style

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint configuration
- Components should be pure and reusable
- Avoid deeply nested code (max 3 levels)

```typescript
// ✅ Good
export const fetchData = async (id: string): Promise<Data> => {
  try {
    const response = await api.get(`/data/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
};

// ❌ Bad
const fetchData = (id) => {
  return fetch(`/api/data/${id}`)
    .then(res => res.json())
    .catch(err => console.log(err));
};
```

### React Components

- Use functional components with hooks
- Define prop interfaces
- Extract custom hooks for reusable logic
- Keep components focused and testable

```typescript
// ✅ Good
interface DataDisplayProps {
  title: string;
  items: Item[];
  isLoading?: boolean;
}

const DataDisplay: FC<DataDisplayProps> = ({ title, items, isLoading }) => {
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      <h1>{title}</h1>
      <ItemList items={items} />
    </div>
  );
};

// ❌ Bad
const DataDisplay = (props) => {
  return (
    <div>
      <h1>{props.title}</h1>
      {props.items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
};
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add new tool registry system
fix: Resolve session timeout issue
docs: Update API documentation
style: Format code with Prettier
test: Add unit tests for SessionService
chore: Update dependencies
```

Format: `type: description`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `test` - Tests
- `chore` - Dependencies/build
- `refactor` - Code refactoring

## Pull Request Process

1. Update documentation if needed
2. Add/update tests for your changes
3. Ensure tests pass: `npm test --workspaces`
4. Build locally: `npm run build --workspaces`
5. Keep PR focused on one feature/fix
6. Write descriptive PR title and description

### PR Template

```markdown
## Description
Brief description of changes

## Related Issues
Fixes #ISSUE_NUMBER

## Changes Made
- List of changes
- Another change
- One more change

## Testing
How to test the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

## Adding a New Feature

### New Tool

1. Create tool class in `sandbox/src/tools/YourTool.ts`:

```typescript
import { Tool } from './ToolRegistry';

export class YourTool implements Tool {
  name = 'yourtool';
  description = 'Description of your tool';

  listActions(): string[] {
    return ['action1', 'action2'];
  }

  async execute(action: string, params: any): Promise<any> {
    // Implementation
  }
}
```

2. Register in `sandbox/src/index.ts`
3. Add tests in `sandbox/src/tools/YourTool.test.ts`
4. Update documentation in README.md
5. Add usage examples

### New API Endpoint

1. Create controller in `server/src/controllers/YourController.ts`
2. Add routes to `server/src/index.ts`
3. Add type definitions in `server/src/types/index.ts`
4. Write tests in `server/src/controllers/YourController.test.ts`
5. Document in API section of README.md

### New UI Component

1. Create component in `web/src/components/YourComponent.tsx`
2. Create stylesheet in `web/src/components/YourComponent.css`
3. Add to appropriate parent component
4. Write tests in `web/src/components/YourComponent.test.tsx`
5. Add to Storybook (if available)

## Testing

Write tests for all new features:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  let component: YourComponent;

  beforeEach(() => {
    component = new YourComponent();
  });

  it('should initialize with default values', () => {
    expect(component.value).toBe(0);
  });

  it('should handle action correctly', async () => {
    await component.executeAction();
    expect(component.result).toBeDefined();
  });
});
```

## Documentation

Update documentation for:
- New features
- API changes
- Configuration options
- Breaking changes
- Migration guides

## Issues

Before working on an issue:
1. Check if it's already being worked on
2. Comment on the issue to indicate you're working on it
3. Follow the PR process when ready to submit

## Performance

Consider performance when contributing:
- Minimize re-renders in React components
- Use lazy loading for heavy data
- Optimize database queries
- Cache results when appropriate
- Profile code with DevTools

## Security

- Never commit secrets or API keys
- Validate user input
- Sanitize data in templates
- Use environment variables for config
- Keep dependencies updated

## Reporting Bugs

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/videos
- Environment (OS, Node version, etc.)
- Error messages/logs

## Feature Requests

Describe:
- The problem being solved
- Proposed solution
- Alternative approaches considered
- Use cases and examples

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review similar code in the project
- Check issues for similar topics

## Code Review

All PRs require review before merging. Be open to feedback and suggestions - they help improve code quality!

## Building and Testing Locally

```bash
# Install dependencies
npm install --workspaces

# Build all packages
npm run build --workspaces

# Run all tests
npm test --workspaces

# Run specific workspace tests
npm test --workspace=web

# Build for production
npm run build --workspaces

# Lint code
npm run lint --workspaces

# Format code
npm run format --workspaces
```

## Deployment

For maintainers preparing a release:

1. Update version in all `package.json` files
2. Update CHANGELOG.md
3. Create git tag: `git tag v0.x.x`
4. Push to GitHub: `git push origin v0.x.x`
5. Build Docker images: `npm run docker:build`
6. Push to registry: `docker push openmux:latest`

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to OpenMux! 🙏
