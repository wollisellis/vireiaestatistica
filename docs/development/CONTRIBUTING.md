# Contributing to VireiEstatística

Thank you for your interest in contributing to VireiEstatística! This project aims to revolutionize biostatistics education through interactive learning, and we welcome contributions from educators, developers, researchers, and students.

## 🎯 Project Mission

VireiEstatística is designed to make biostatistics accessible and engaging for nutrition and sports science students through:
- Interactive game-based learning
- Real-world research data applications
- Progressive skill development
- Modern web technologies

## 🤝 Ways to Contribute

### 1. **Educational Content**
- Create new statistical games and exercises
- Develop real-world datasets from nutrition/sports research
- Write explanatory content and tutorials
- Review and improve existing educational materials

### 2. **Technical Development**
- Fix bugs and improve performance
- Add new features and functionality
- Enhance user interface and experience
- Improve accessibility and mobile responsiveness

### 3. **Documentation**
- Improve setup and usage instructions
- Create developer documentation
- Write user guides and tutorials
- Translate content to other languages

### 4. **Testing and Quality Assurance**
- Report bugs and issues
- Test new features and provide feedback
- Perform accessibility testing
- Validate educational content accuracy

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Basic knowledge of React/Next.js (for technical contributions)
- Understanding of biostatistics (for educational content)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/vireiestatistica.git
   cd vireiestatistica
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Contribution Guidelines

### Code Standards

#### **TypeScript**
- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for data structures

#### **React/Next.js**
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use Next.js App Router conventions

#### **Styling**
- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design
- Maintain accessibility standards

#### **Code Quality**
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Format code
npm run format
```

### Educational Content Standards

#### **Statistical Accuracy**
- Ensure all statistical concepts are correct
- Provide proper citations for research data
- Use appropriate statistical terminology
- Include clear explanations and examples

#### **Learning Objectives**
- Define clear learning outcomes
- Structure content progressively
- Include practical applications
- Provide immediate feedback

#### **Data Sources**
- Use authentic research data when possible
- Ensure data privacy and ethical compliance
- Provide proper attribution
- Include diverse examples from nutrition and sports science

### Commit Message Format

Use conventional commits for clear history:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add Firebase authentication integration
fix(dashboard): resolve progress bar animation issue
docs(readme): update installation instructions
content(games): add new correlation analysis game
```

### Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new features
   - Follow code style guidelines

2. **Pull Request Description:**
   - Clearly describe the changes
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process:**
   - Maintainers will review within 48 hours
   - Address feedback promptly
   - Keep discussions constructive
   - Be patient during the review process

## 🐛 Reporting Issues

### Bug Reports
Include the following information:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
- Screenshots or error messages

### Feature Requests
Provide:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- Educational value (for content features)

### Educational Content Issues
Include:
- Specific game or content area
- Description of the issue
- Suggested corrections
- Supporting references

## 🎓 Educational Contributions

### Adding New Games

1. **Game Design Document**
   - Learning objectives
   - Target difficulty level
   - Statistical concepts covered
   - User interaction flow
   - Assessment criteria

2. **Implementation**
   - Create game component
   - Add to game progression system
   - Include explanatory content
   - Implement scoring logic

3. **Testing**
   - Validate educational effectiveness
   - Test user experience
   - Ensure accessibility
   - Verify statistical accuracy

### Dataset Contributions

1. **Data Requirements**
   - Relevant to nutrition/sports science
   - Appropriate for educational use
   - Properly anonymized
   - Clear variable descriptions

2. **Documentation**
   - Data source and collection methods
   - Variable definitions
   - Statistical properties
   - Suggested use cases

## 🏆 Recognition

Contributors will be recognized through:
- GitHub contributor list
- Project documentation
- Academic acknowledgments (where appropriate)
- Community highlights

## 📞 Getting Help

- **GitHub Discussions**: For general questions and ideas
- **GitHub Issues**: For bug reports and feature requests
- **Email**: [elliswollismalta@gmail.com](mailto:elliswollismalta@gmail.com) for academic collaboration

## 📄 License

By contributing to VireiEstatística, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Your contributions help advance biostatistics education and make statistical learning more accessible to students worldwide. Every contribution, no matter how small, makes a difference!

---

**Happy Contributing! 🎉**
