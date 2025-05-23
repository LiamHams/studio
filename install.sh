#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# !!! IMPORTANT: REVIEW THESE VALUES. GITHUB_REPO_URL & APP_CLONE_DIR ARE SET BASED ON YOUR REQUEST. !!!
GITHUB_REPO_URL="https://github.com/LiamHams/studio.git"
APP_CLONE_DIR="studio"           # Directory name for the cloned project (should match your repo name)
PM2_APP_NAME="tunnelvision"      # Name for your app in PM2
APP_PORT="3000"                  # Port your Next.js app will run on (change if needed)
NODE_VERSION="20"                # Specify Node.js LTS version (e.g., 18, 20)
# !!! END OF CONFIGURATION YOU MIGHT WANT TO EDIT !!!

# --- Helper Functions ---
print_step() {
  echo ""
  echo "================================================"
  echo "STEP: $1"
  echo "================================================"
  echo ""
}

# --- Installation Steps ---

print_step "Updating package lists"
sudo apt update -y

print_step "Installing prerequisites: curl and git"
sudo apt install curl git -y

print_step "Installing NVM (Node Version Manager)"
if [ -d "$HOME/.nvm" ]; then
  echo "NVM already installed. Skipping."
else
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

print_step "Loading NVM into current session"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Verify NVM is loaded
if ! command -v nvm &> /dev/null; then
    echo "NVM could not be loaded. You might need to close and reopen your terminal,"
    echo "or source your .bashrc/.zshrc file (e.g., 'source ~/.bashrc')."
    echo "Attempting to source ~/.bashrc..."
    source "$HOME/.bashrc"
    if ! command -v nvm &> /dev/null; then
        echo "Failed to load NVM even after sourcing .bashrc. Please ensure NVM is correctly installed and in your PATH."
        exit 1
    fi
fi
echo "NVM version: $(nvm --version)"

print_step "Installing Node.js v$NODE_VERSION LTS via NVM and setting as default"
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"
nvm alias default "$NODE_VERSION"

echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"

print_step "Navigating to or cloning project from GitHub: $GITHUB_REPO_URL into $APP_CLONE_DIR"
# If script is run from outside the cloned directory
if [ "$(basename "$PWD")" != "$APP_CLONE_DIR" ]; then
    if [ -d "$APP_CLONE_DIR" ]; then
        echo "Directory '$APP_CLONE_DIR' already exists. Changing into it."
        cd "$APP_CLONE_DIR"
        echo "You might want to pull the latest changes manually: git pull"
    else
        echo "Cloning repository into '$APP_CLONE_DIR'..."
        git clone "$GITHUB_REPO_URL" "$APP_CLONE_DIR"
        cd "$APP_CLONE_DIR"
    fi
else
    # Script is run from inside the APP_CLONE_DIR (e.g., 'studio')
    echo "Already in project directory '$PWD'. Skipping clone."
    echo "You might want to pull the latest changes manually: git pull"
fi


print_step "Installing project dependencies with npm"
npm install

print_step "Building Next.js application for production"
npm run build

print_step "Installing PM2 (Process Manager) globally if not already installed"
if ! command -v pm2 &> /dev/null; then
  sudo npm install pm2 -g
else
  echo "PM2 is already installed."
fi
PM2_PATH=$(which pm2)
echo "PM2 version: $($PM2_PATH --version)"

print_step "Starting application with PM2 (Name: $PM2_APP_NAME, Port: $APP_PORT)"
# Ensure any existing process with the same name is deleted before starting
$PM2_PATH delete "$PM2_APP_NAME" || true # true to ignore error if process doesn't exist
PORT=$APP_PORT $PM2_PATH start npm --name "$PM2_APP_NAME" -- run start

print_step "Configuring PM2 to start on system boot"
# This command generates and tries to execute the system-specific command for startup.
# It might still print a command for you to run manually if it can't do it itself.
# Using $(whoami) for the user and $HOME for the home path.
sudo env PATH=$PATH:$HOME/.nvm/versions/node/$(nvm current)/bin $PM2_PATH startup systemd -u $(whoami) --hp $HOME

print_step "Saving current PM2 process list"
$PM2_PATH save

print_step "Configuring UFW (Firewall) to allow traffic on port $APP_PORT"
sudo ufw allow $APP_PORT/tcp
# Ensure SSH is allowed before enabling UFW to prevent lockout
sudo ufw allow ssh
if ! sudo ufw status | grep -qw active; then
  echo "UFW is not active. Enabling UFW."
  sudo ufw --force enable # Using --force to avoid interactive prompt
else
  echo "UFW is already active."
fi
sudo ufw status

print_step "Checking application status and retrieving server IP"
SERVER_IP=$(curl -s ifconfig.me)
if [ -z "$SERVER_IP" ]; then
    # Fallback for public IP, try local IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    if [ -z "$SERVER_IP" ]; then
        SERVER_IP="<your_server_ip>" # Further fallback message
        echo "Could not automatically determine a usable IP address. Please find it manually."
    else
        echo "Could not determine public IP. Using local IP: $SERVER_IP (This might not be accessible from outside your network)."
    fi
else
    echo "Determined public IP: $SERVER_IP"
fi

echo "Attempting to access the panel locally on port $APP_PORT to verify..."
# Adding a small delay for the app to fully start
sleep 5 
if curl -s --fail "http://localhost:$APP_PORT/login" > /dev/null; then
    echo "Application is UP and responding locally!"
    ACCESS_MESSAGE="Access TunnelVision at: http://$SERVER_IP:$APP_PORT"
else
    echo "Application might not be responding locally on http://localhost:$APP_PORT/login"
    echo "This could be a temporary issue or the app might have failed to start correctly."
    echo "Please check PM2 logs for more details: pm2 logs $PM2_APP_NAME"
    ACCESS_MESSAGE="Attempt to access TunnelVision at: http://$SERVER_IP:$APP_PORT (Local check failed, but it might still be accessible externally)"
fi


echo ""
print_step "Installation and Setup Complete!"
echo "------------------------------------------------------------------"
echo "Your application '$PM2_APP_NAME' should now be running."
echo "$ACCESS_MESSAGE"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 list             : List all running processes managed by PM2"
echo "  pm2 logs $PM2_APP_NAME : View logs for your application"
echo "  pm2 restart $PM2_APP_NAME: Restart your application"
echo "  pm2 stop $PM2_APP_NAME   : Stop your application"
echo ""
echo "Important Next Steps:"
echo "1. The GitHub repository URL in this script is set to '$GITHUB_REPO_URL'."
echo "2. Ensure the hardcoded credentials in 'src/lib/auth.ts' (admin/password) are changed if this is not for local testing only."
echo "   If you change them, rebuild the app (npm run build) and restart PM2 (pm2 restart $PM2_APP_NAME)."
echo "3. You might need to log out and log back in or source your shell configuration"
echo "   (e.g., 'source ~/.bashrc' or 'source ~/.zshrc') for NVM changes to take full effect in new terminals."
echo "------------------------------------------------------------------"

exit 0
