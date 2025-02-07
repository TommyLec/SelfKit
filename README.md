
<img src="https://selfkit.dev/favicon.png" alt="Selfkit" width="100px">

# SelfKit

SelfKit is a **SaaS boilerplate** designed for developers who want to quickly build and deploy web applications. He is **self-hosting** oriented, meaning it is built with open-source tools and provides a convenient way to be hosted with Coolify or any Docker-compatible infrastructure.

## Links

- [Official website](https://selfkit.dev/)
- [Documentation](https://docs.selfkit.dev/docs)
- [Live demo](https://demo.selfkit.dev/)



## 🚀 Main Features

- **Authentication**:
  - Email/Password
  - Google login
  - 2FA
  - Rate limiting
  - Password checking
- **Payment**:
  - Checkout page
  - Pricing component
  - Product and subscriptions auto update (webhook)
- **SEO**: Meta tags, Open graph, JSON-LD
- **Blog**: with markdown and RSS flux
- **Analytics**
- **Emails**
- **Internationalization**
- **Database auto migration**
- **Coolify deployment script**
- **Default terms & privacy pages**
- **UI components**:
  - Features grid
  - Call to action
  - Problem

## 🛠️ Technical stack

- **Framework**: SvelteKit
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Lucia (learning resource)
- **Payments**: Paddle
- **Analytics Tracking**: Umami
- **Emails**: Plunk
- **UI & Design**: Tailwind + Shadcn Svelte
- **Internationalization**: Paraglide
- **Forms**: Superform + Zod

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/selfkit.git
cd selfkit
```

### 2. Configure environment variables
Copy the `.env.example` file to `.env` and fill in the required information.
```bash
cp .env.example .env
```

### 3. Install dependencies
```bash
pnpm install
```

### 4. Run the application locally
```bash
docker-compose -f docker-compose.dev.yaml up
pnpm run dev
```
## ✅ Testing & CI/CD
SelfKit includes Playwright integration for end-to-end testing.

### Run tests locally
```bash
pnpm run test
```

### CI/CD with GitHub Actions
Tests are automatically executed on every **push** or **pull request** via GitHub Actions.

## 🚀 Deployment
SelfKit is designed for easy deployment on **Coolify** or any Docker-compatible infrastructure.
```bash
docker-compose up -d
```

Check our ```DEPLOY.md``` file or the [documentation](https://docs.selfkit.dev/docs/coolify) for more details about the installation with Coolify.


## FAQ

#### What is SelfKit exactly?

SelfKit is a boilerplate for launching SaaS applications quickly and easily. It’s designed for developers who want to self-host their projects using open-source tools, minimizing recurring costs and external dependencies.

#### What kind of applications can I build with SelfKit?

You can build any type of SaaS platform, from subscription-based services to one-time purchase products. It’s particularly well-suited for apps requiring user authentication, payment processing, and analytics.

#### Why self-hosting?

Self-hosting gives you full control over your application and reduces reliance on third-party services, which can introduce hidden costs and data security concerns.

#### Which version of Svelte does SelfKit use?

Svelte 5!
## 📜 License
SelfKit is open-source and licensed under MIT.

---

💡 **Need help?** Open an issue on GitHub!
