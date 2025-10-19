# Contributing to Chai Platform

Welcome! We're excited that you're interested in contributing to the Chai Platform. This document outlines the process for contributing to the project.

## 📋 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat all contributors and users with respect and professionalism.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/chai-platform.git`
3. Create a branch for your feature: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a pull request

## 📁 Project Structure

Before contributing, familiarize yourself with our project structure:

- `contracts/` - Solidity smart contracts
- `frontend/` - Frontend application (HTML, CSS, JavaScript)
- `api/` - Backend API services
- `db/` - Database schema and migrations
- `tests/` - Test suites

## 🛠️ Development Guidelines

### Code Style

- Follow existing code patterns in the project
- Use consistent indentation (2 spaces)
- Write clear, descriptive variable and function names
- Comment complex logic
- Keep functions focused and small

### JavaScript/Vanilla JS

- Use modern ES6+ features
- Prefer async/await over callbacks
- Handle errors appropriately
- Use the existing wallet integration patterns

### Solidity

- Follow Solidity style guide
- Use appropriate visibility modifiers
- Include comprehensive event logging
- Implement proper access controls
- Write secure, gas-efficient code

### Database

- Use the existing Drizzle ORM patterns
- Follow naming conventions in schema
- Add appropriate indexes for performance
- Write migrations for schema changes

## 🧪 Testing

All contributions should include appropriate tests:

### Unit Tests
```bash
pnpm run test
```

### End-to-End Tests
```bash
pnpm run test:e2e
```

### Test Guidelines

- Write tests for new functionality
- Update existing tests when modifying functionality
- Ensure all tests pass before submitting a pull request
- Include edge cases in your tests

## 📝 Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if you've changed functionality
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request with a clear title and description

### Pull Request Description

Include the following in your pull request:

- A clear description of the changes
- The problem being solved
- How your solution addresses the problem
- Any breaking changes
- Screenshots if applicable

## 🐛 Reporting Issues

Before submitting an issue:

1. Check if the issue already exists
2. Try to reproduce the issue
3. Include detailed steps to reproduce
4. Include environment information (OS, browser, etc.)

When submitting an issue, include:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment information

## 📚 Documentation

Improvements to documentation are always welcome:

- Fix typos and grammatical errors
- Clarify confusing sections
- Add missing information
- Update outdated information

## 🔒 Security

If you discover a security vulnerability, please:

1. Do NOT create a public issue
2. Contact the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

## 🎨 Design Contributions

For UI/UX improvements:

- Follow existing design patterns
- Ensure responsive design
- Maintain accessibility standards
- Test across different browsers

## 🤝 Community

Join our community discussions:

- Participate in GitHub discussions
- Help answer questions from other developers
- Share your experiences and use cases
- Provide feedback on proposed features

## 📄 License

By contributing to Chai Platform, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Chai Platform! 🌱