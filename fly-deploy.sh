#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Set path to flyctl
FLYCTL="/home/millz/.fly/bin/flyctl"

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}    MillzMaleficarum Fly.io Deploy    ${NC}"
echo -e "${YELLOW}======================================${NC}"

# Check if Fly CLI is installed
if [ ! -f "$FLYCTL" ]; then
  echo -e "${RED}Error: Fly CLI (flyctl) is not installed at expected path: $FLYCTL${NC}"
  echo -e "Please install it by following the instructions at: https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
fi

# Check if user is logged in
echo -e "${YELLOW}Checking Fly.io authentication...${NC}"
if ! $FLYCTL auth whoami &> /dev/null; then
  echo -e "${YELLOW}You need to login to Fly.io${NC}"
  echo -e "Please open this URL in your browser to log in: https://fly.io/app/auth/cli"
  $FLYCTL auth login
else
  echo -e "${GREEN}Already logged in to Fly.io.${NC}"
fi

# Run git status to check for uncommitted changes
echo -e "${YELLOW}Checking git status...${NC}"
if git status --porcelain | grep -q '^'; then
  echo -e "${YELLOW}Warning: You have uncommitted changes.${NC}"
  echo -e "It's recommended to commit your changes before deploying."
  
  # Ask if user wants to continue
  read -p "Do you want to continue with deployment anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment canceled.${NC}"
    exit 0
  fi
else
  echo -e "${GREEN}Git working directory is clean.${NC}"
fi

# Check if app already exists
echo -e "${YELLOW}Checking if app already exists on Fly.io...${NC}"
APP_NAME="millzmaleficarum-v0-6"
if $FLYCTL apps list | grep -q "$APP_NAME"; then
  echo -e "${GREEN}App '$APP_NAME' already exists.${NC}"
  APP_EXISTS=true
else
  echo -e "${YELLOW}App '$APP_NAME' does not exist yet.${NC}"
  APP_EXISTS=false
fi

# Launch/deploy app
if [ "$APP_EXISTS" = false ]; then
  echo -e "${YELLOW}Creating new app on Fly.io...${NC}"
  $FLYCTL launch --no-deploy --copy-config --name "$APP_NAME"
fi

# Deploy the app
echo -e "${YELLOW}Deploying app to Fly.io...${NC}"
$FLYCTL deploy

# Output success message
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}    Deployment Complete!              ${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "Your app is now deployed at: https://$APP_NAME.fly.dev"
echo -e "You can check its status with: $FLYCTL status -a $APP_NAME"
echo -e "And view logs with: $FLYCTL logs -a $APP_NAME"