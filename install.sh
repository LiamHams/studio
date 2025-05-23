#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# !!! IMPORTANT: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL VALUES !!!
GITHUB_REPO_URL="https://github.com/your-username/your-repo-name.git"
APP_CLONE_DIR="tunnelvision-app" # Desired directory name for the cloned project
PM2_APP_NAME="tunnelvision"      # Name for your app in PM2
APP_PORT="3000"                  # Port your Next.js app will run on
NODE_VERSION="20"                # Specify Node.js LTS version (e.g., 18, 20)
# !!! END OF CONFIGURATION YOU MUST EDIT !!!

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

print_step "Cloning project from GitHub: $GITHUB_REPO_URL"
if [ -d "$APP_CLONE_DIR" ]; then
  echo "Directory '$APP_CLONE_DIR' already exists. Skipping clone. You might want to pull latest changes manually."
else
  git clone "$GITHUB_REPO_URL" "$APP_CLONE_DIR"
fi
cd "$APP_CLONE_DIR"

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
echo "PM2 version: $(pm2 --version)"

print_step "Starting application with PM2 (Name: $PM2_APP_NAME, Port: $APP_PORT)"
# Ensure any existing process with the same name is deleted before starting
pm2 delete "$PM2_APP_NAME" || true # true to ignore error if process doesn't exist
PORT=$APP_PORT pm2 start npm --name "$PM2_APP_NAME" -- run start

print_step "Configuring PM2 to start on system boot"
# This command generates and tries to execute the system-specific command for startup.
# It might still print a command for you to run manually if it can't do it itself.
sudo env PATH=$PATH:$HOME/.nvm/versions/node/$(nvm current)/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $(whoami) --hp $HOME
# The path to pm2 might vary if npm global prefix is different.
# A more robust way to find pm2: sudo env PATH=$PATH:$(dirname $(which node))/../lib/node_modules/pm2/bin/pm2 ...

print_step "Saving current PM2 process list"
pm2 save

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

echo ""
print_step "Installation and Setup Complete!"
echo "------------------------------------------------------------------"
echo "Your application '$PM2_APP_NAME' should now be running."
echo "You can access it at: http://<your_server_ip>:$APP_PORT"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 list             : List all running processes managed by PM2"
echo "  pm2 logs $PM2_APP_NAME : View logs for your application"
echo "  pm2 restart $PM2_APP_NAME: Restart your application"
echo "  pm2 stop $PM2_APP_NAME   : Stop your application"
echo ""
echo "Important Next Steps:"
echo "1. If you haven't already, update the GITHUB_REPO_URL in this script."
echo "2. Ensure the hardcoded credentials in 'src/lib/auth.ts' are appropriate for your use case."
echo "   (Default: admin/password). If you change them, rebuild the app (npm run build) and restart PM2."
echo "3. You might need to log out and log back in or source your shell configuration"
echo "   (e.g., 'source ~/.bashrc' or 'source ~/.zshrc') for NVM changes to take full effect in new terminals."
echo "------------------------------------------------------------------"

exit 0
