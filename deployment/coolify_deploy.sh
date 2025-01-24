#!/bin/bash

# Change to script directory
cd "$(dirname "$0")"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Please install jq first."
    echo "Windows (with chocolatey): choco install jq"
    echo "Linux: sudo apt-get install jq"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Error: .env not found!"
    echo "Please copy .env.example to .env and update the values."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Function to make API calls
make_api_call() {
    local method=$1
    local endpoint=$2
    local payload=$3
    
    local response
    if [ -z "$payload" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "${COOLIFY_URL}:8000/api/v1/${endpoint}" \
            -H "Authorization: Bearer ${COOLIFY_TOKEN}")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "${COOLIFY_URL}:8000/api/v1/${endpoint}" \
            -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$payload")
    fi
    
    # Split response into body and status code
    local body=$(echo "$response" | sed '$d')
    local status_code=$(echo "$response" | tail -n1)
    
    # Check if status code indicates an error
    if [ "$status_code" -ge 400 ]; then
        echo "Error: $body"
        return 1
    fi
    
    echo "$body"
}

# Function to encode file content to base64
encode_file() {
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # For Windows (Git Bash)
        base64 -w 0 "$1"
    else
        # For Linux/Mac
        base64 -w 0 < "$1"
    fi
}

# Function to generate random string
generate_random() {
    local length=$1
    local result=""
    local chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    
    # Use openssl if available (more secure)
    if command -v openssl >/dev/null 2>&1; then
        result=$(openssl rand -base64 $((length * 2)) | tr -dc 'a-zA-Z0-9' | head -c "$length")
    else
        # Fallback to bash random (less secure but works everywhere)
        local chars_length=${#chars}
        for ((i = 0; i < length; i++)); do
            local random_index=$((RANDOM % chars_length))
            result+=${chars:$random_index:1}
        done
    fi
    echo "$result"
}

echo "Starting Coolify initialization..."

# 1. Create new project
echo "Creating new project..."
PROJECT_RESPONSE=$(make_api_call "POST" "projects" '{"name": "SelfKit2"}')

# Check if response is valid JSON
if ! echo "$PROJECT_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid response - $PROJECT_RESPONSE"
    exit 1
fi

PROJECT_UUID=$(echo "$PROJECT_RESPONSE" | jq -r '.uuid // empty')

if [ -z "$PROJECT_UUID" ]; then
    echo "Error: Could not create project - $PROJECT_RESPONSE"
    exit 1
fi
echo "Project UUID: $PROJECT_UUID"

# 2. Get project environment
echo "Getting project environment..."
ENV_RESPONSE=$(make_api_call "GET" "projects/$PROJECT_UUID/production")

# Check if response is valid JSON
if ! echo "$ENV_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid environment response - $ENV_RESPONSE"
    exit 1
fi

ENV_NAME=$(echo "$ENV_RESPONSE" | jq -r '.name // empty')

if [ -z "$ENV_NAME" ]; then
    echo "Error: Could not get environment - $ENV_RESPONSE"
    exit 1
fi

echo "Environment Name: $ENV_NAME"

# 3. Get server UUID
echo "Getting server UUID..."
SERVER_RESPONSE=$(make_api_call "GET" "servers")
SERVER_UUID=$(echo "$SERVER_RESPONSE" | jq -r '.[0].uuid')

if [ -z "$SERVER_UUID" ] || [ "$SERVER_UUID" = "null" ]; then
    echo "Failed to get server UUID"
    exit 1
fi
echo "Server UUID: $SERVER_UUID"

# Generate random database credentials
DB_USER="${DB_USER}_$(generate_random 8)"
DB_PASSWORD=$(generate_random 16)

# Create database payload
DB_PAYLOAD=$(cat << EOF
{
    "name": "$DB_NAME",
    "project_uuid": "$PROJECT_UUID",
    "environment_name": "$ENV_NAME",
    "server_uuid": "$SERVER_UUID",
    "postgres_user": "$DB_USER",
    "postgres_password": "$DB_PASSWORD",
    "postgres_db": "$DB_NAME",
    "is_public": true,
    "public_port": 5432,
    "instant_deploy": true
}
EOF
)

DB_RESPONSE=$(make_api_call "POST" "databases/postgresql" "$DB_PAYLOAD")

# Check if response is valid JSON
if ! echo "$DB_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid database response - $DB_RESPONSE"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Error: Failed to create database - $DB_RESPONSE"
    exit 1
fi

echo "Database created successfully!"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "Database Password: Check it on your Coolify dashboard or in coolify.config.json"

# Create Umami service
echo "Creating Umami service..."
UMAMI_PAYLOAD=$(cat << EOF
{
    "type": "umami",
    "name": "$UMAMI_NAME",
    "project_uuid": "$PROJECT_UUID",
    "environment_name": "$ENV_NAME",
    "server_uuid": "$SERVER_UUID",
    "instant_deploy": true
}
EOF
)

UMAMI_RESPONSE=$(make_api_call "POST" "services" "$UMAMI_PAYLOAD")

# Check if response is valid JSON
if ! echo "$UMAMI_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid Umami service response - $UMAMI_RESPONSE"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Error: Failed to create Umami service - $UMAMI_RESPONSE"
    exit 1
fi

UMAMI_UUID=$(echo "$UMAMI_RESPONSE" | jq -r '.uuid // empty')
if [ -z "$UMAMI_UUID" ]; then
    echo "Error: Could not get Umami service UUID"
    exit 1
fi

echo "Umami service created successfully!"

# Create Plunk service
echo "Creating Plunk service..."
PLUNK_PAYLOAD=$(cat << EOF
{
    "type": "plunk",
    "name": "$PLUNK_NAME",
    "project_uuid": "$PROJECT_UUID",
    "environment_name": "$ENV_NAME",
    "server_uuid": "$SERVER_UUID",
    "instant_deploy": true
}
EOF
)

PLUNK_RESPONSE=$(make_api_call "POST" "services" "$PLUNK_PAYLOAD")

# Check if response is valid JSON
if ! echo "$PLUNK_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid Plunk service response - $PLUNK_RESPONSE"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Error: Failed to create Plunk service - $PLUNK_RESPONSE"
    exit 1
fi

PLUNK_UUID=$(echo "$PLUNK_RESPONSE" | jq -r '.uuid // empty')
if [ -z "$PLUNK_UUID" ]; then
    echo "Error: Could not get Plunk service UUID"
    exit 1
fi

echo "Plunk service created successfully!"

# Get service FQDNs
echo "Getting service URLs..."

# Get Umami service environment variables
UMAMI_ENV_RESPONSE=$(make_api_call "GET" "services/$UMAMI_UUID/envs")

# Check if response is valid JSON
if ! echo "$UMAMI_ENV_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid Umami environment response - $UMAMI_ENV_RESPONSE"
    exit 1
fi

UMAMI_FQDN=$(echo "$UMAMI_ENV_RESPONSE" | jq -r '.[] | select(.key=="SERVICE_FQDN_UMAMI") | .value // empty')

if [ -z "$UMAMI_FQDN" ]; then
    echo "Warning: Could not get Umami FQDN"
fi

# Get Plunk service environment variables
PLUNK_ENV_RESPONSE=$(make_api_call "GET" "services/$PLUNK_UUID/envs")

# Check if response is valid JSON
if ! echo "$PLUNK_ENV_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid Plunk environment response - $PLUNK_ENV_RESPONSE"
    exit 1
fi

PLUNK_FQDN=$(echo "$PLUNK_ENV_RESPONSE" | jq -r '.[] | select(.key=="SERVICE_FQDN_PLUNK") | .value // empty')

if [ -z "$PLUNK_FQDN" ]; then
    echo "Warning: Could not get Plunk FQDN"
fi

# Get Github app UUID
echo "Getting Github app UUID..."
GITHUB_APP_RESPONSE=$(make_api_call "GET" "security/keys")

# Check if response is valid JSON
if ! echo "$GITHUB_APP_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid GitHub app response - $GITHUB_APP_RESPONSE"
    exit 1
fi

GITHUB_APP_UUID=$(echo "$GITHUB_APP_RESPONSE" | jq -r --arg name "$GITHUB_APP_NAME" '.[] | select(.name==$name) | .uuid // empty')
if [ -z "$GITHUB_APP_UUID" ]; then
    echo "Error: Could not get GitHub app UUID for app name: $GITHUB_APP_NAME"
    exit 1
fi

# Create application
echo "Creating application..."
APP_PAYLOAD=$(cat << EOF
{
    "name": "$APP_NAME",
    "project_uuid": "$PROJECT_UUID",
    "environment_name": "$ENV_NAME",
    "server_uuid": "$SERVER_UUID",
    "github_app_uuid": "$GITHUB_APP_UUID",
    "git_repository": "$GITHUB_REPOSITORY",
    "git_branch": "$GITHUB_BRANCH",
    "ports_exposes": "5173",
    "build_pack": "nixpacks",
    "instant_deploy": false,
    "install_command": "pnpm install",
    "build_command": "pnpm run build",
    "start_command": "pnpm run prod"
}
EOF
)

APP_RESPONSE=$(make_api_call "POST" "applications/private-github-app" "$APP_PAYLOAD")

# Check if response is valid JSON
if ! echo "$APP_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid application response - $APP_RESPONSE"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Error: Failed to create application - $APP_RESPONSE"
    exit 1
fi

APP_UUID=$(echo "$APP_RESPONSE" | jq -r '.uuid // empty')
if [ -z "$APP_UUID" ]; then
    echo "Error: Could not get application UUID"
    exit 1
fi

echo "Application created successfully!"

# Add environment variables
echo "Adding environment variables..."
ENCRYPTION_KEY=$(generate_random 16)
ENV_VARS_PAYLOAD=$(cat << EOF
{
    "data": [
        {
            "key": "PLUNK_URL",
            "value": "$PLUNK_FQDN",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "DB_CONNECTION_STRING",
            "value": "postgresql://$DB_USER:$DB_PASSWORD@$COOLIFY_URL:5432/$DB_NAME",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "GOOGLE_CLIENT_ID",
            "value": "",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "GOOGLE_CLIENT_SECRET",
            "value": "",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "GOOGLE_REDIRECT_URI",
            "value": "http://APP_URI/auth/google/callback",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "PADDLE_API_KEY",
            "value": "",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "PUBLIC_PADDLE_CLIENT_TOKEN",
            "value": "",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "PADDLE_PRODUCTS_WEBHOOK_KEY",
            "value": "",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "PADDLE_SUBSCRIPTION_WEBHOOK_KEY",
            "value": "",
            "is_preview": "true",
            "is_shown_once": "true"
        },
        {
            "key": "ENCRYPTION_KEY",
            "value": "$ENCRYPTION_KEY",
            "is_preview": "true",
            "is_shown_once": "true"
        }
    ]
}
EOF
)

ENV_VARS_RESPONSE=$(make_api_call "POST" "services/$APP_UUID/envs/bulk" "$ENV_VARS_PAYLOAD")

# Check if response is valid JSON
if ! echo "$ENV_VARS_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "Error: Invalid environment variables response - $ENV_VARS_RESPONSE"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "Error: Failed to create environment variables - $ENV_VARS_RESPONSE"
    exit 1
fi

echo "Environment variables created successfully!"

# Save configuration for future use
echo "Saving configuration..."
cat > "coolify.config.json" << EOF
{
    "project": {
        "uuid": "$PROJECT_UUID",
        "name": "SelfKit"
    },
    "environment": {
        "name": "$ENV_NAME"
    },
    "server": {
        "uuid": "$SERVER_UUID"
    },
    "database": {
        "name": "$DB_NAME",
        "user": "$DB_USER",
        "password": "$DB_PASSWORD"
    },
    "services": {
        "umami": {
            "name": "$UMAMI_NAME",
            "uuid": "$UMAMI_UUID",
            "fqdn": "$UMAMI_FQDN"
        },
        "plunk": {
            "name": "$PLUNK_NAME",
            "uuid": "$PLUNK_UUID",
            "fqdn": "$PLUNK_FQDN"
        },
        "app": {
            "name": "$APP_NAME",
            "uuid": "$APP_UUID",
            "fqdn": "$APP_FQDN",
            "repository": "$GITHUB_REPOSITORY",
            "branch": "$GITHUB_BRANCH"
        }
    }
}
EOF

echo "Configuration saved to coolify.config.json"
echo "Initialization completed successfully!"
echo
echo "Service URLs:"
[ ! -z "$UMAMI_FQDN" ] && echo "Umami: $UMAMI_FQDN"
[ ! -z "$PLUNK_FQDN" ] && echo "Plunk: $PLUNK_FQDN"
