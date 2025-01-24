# SelfKit Deployment Guide

This guide explains how to deploy SelfKit using Coolify resources on a server.

## Project Structure

The deployment configuration is located in the `deployment` folder:
```
deployment/
├── DEPLOY.md           # This deployment guide
├── .env.example       # Example environment variables
├── .env              # Your environment configuration (created from example)
└── coolify_deploy.sh  # Coolify initialization script
```

## Prerequisites

1. A Coolify instance running on your server
2. Coolify API token
3. Git repository with your SelfKit code

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp deployment/.env.example deployment/.env
   ```

2. Update the environment variables in `.env`:
   ```env
   # Coolify Configuration
   COOLIFY_TOKEN=your-coolify-token
   COOLIFY_URL=http://your-coolify-server:8000

   # Database
   DB_NAME=selfkit-db
   DB_USER=selfkit

   # Umami
   UMAMI_NAME=selfkit-umami
   UMAMI_VERSION=latest

   # Plunk
   PLUNK_NAME=selfkit-plunk
   PLUNK_VERSION=latest
   ```

## Deployment Steps

1. Run the initialization script:
   ```bash
   cd deployment
   ./coolify_deploy.sh
   ```

   This script will:
   - Create a new project in Coolify
   - Set up a PostgreSQL database
   - Deploy Umami analytics
   - Create a Plunk email service
   - Save the configuration in `coolify.config.json`

2. The script will output important information like database credentials and service URLs. Make sure to save this information securely.

## Post-Deployment

1. Access your Coolify dashboard to monitor the deployments
2. Configure your services:
   - Set up Umami analytics
   - Configure Plunk email settings

## Troubleshooting

If you encounter any issues:
1. Check the Coolify logs for each service
2. Verify your API token has the correct permissions
3. Ensure all required ports are open on your server
4. Check the `.env` file for correct configuration values

## Security Considerations

1. Never commit `.env` or `coolify.config.json` to version control
2. Use strong passwords in configuration
3. Regularly update:
   - Server OS packages
   - Coolify version
   - Application dependencies

## Support

For issues or questions:
- Coolify Documentation: https://coolify.io/docs
- SelfKit Documentation: https://docs.selfkit.dev/docs
- Project Issues: Create an issue in the GitHub repository
