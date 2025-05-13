#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Set path to flyctl
FLYCTL="/home/millz/.fly/bin/flyctl"

# Set Fly.io API token
export FLY_API_TOKEN="FlyV1 fm2_lJPECAAAAAAACLYkxBCj1TTVilFslaKI/zYgJOFSwrVodHRwczovL2FwaS5mbHkuaW8vdjGUAJLOABBmbx8Lk7lodHRwczovL2FwaS5mbHkuaW8vYWFhL3YxxDyD226xJ9OzN53dnWjrWm9F2PnQK/IgyIdfPjC4JLer4WrW4NSHI8YiQS5M8pL2c65TPPOeMvuA0iSvriTETngASn8MsBW/P6y2FwpPYp0sK8PoVmXXX9IhNCQEvSXoI4CPm1Yh90AsgOHHMl0nA1UBmf8y0RVzIwNn0b8YT2mlirBmdvZSkfz7NmUKe8QgkuZhmOPA5A9AI6jAiLyODzaM8vpwRBrrx7XlpGftshQ=,fm2_lJPETngASn8MsBW/P6y2FwpPYp0sK8PoVmXXX9IhNCQEvSXoI4CPm1Yh90AsgOHHMl0nA1UBmf8y0RVzIwNn0b8YT2mlirBmdvZSkfz7NmUKe8QQz332zAU0nMUneZ6TwYUJRsO5aHR0cHM6Ly9hcGkuZmx5LmlvL2FhYS92MZgEks5oI4gizwAAAAEkG6ZAF84AD8QgCpHOAA/EIAzEEEM5giSLZBL7kM/cNblOiiXEILnIRS0sfgZh+mCEuFgCTirtMxUCkT2iYx8VOvxo7TfS"

echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}    MillzMaleficarum Fly.io Deploy    ${NC}"
echo -e "${YELLOW}======================================${NC}"

# Check if Fly CLI is installed
if [ ! -f "$FLYCTL" ]; then
  echo -e "${RED}Error: Fly CLI (flyctl) is not installed at expected path: $FLYCTL${NC}"
  echo -e "Please install it by following the instructions at: https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
fi

# Using API token for authentication
echo -e "${YELLOW}Using Fly.io API token for authentication...${NC}"
echo -e "${GREEN}API token configured.${NC}"

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
  $FLYCTL apps create "$APP_NAME" --org personal
  echo -e "${GREEN}App '$APP_NAME' created.${NC}"
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