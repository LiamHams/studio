
# TunnelVision - Network Tunnel Management Panel

TunnelVision is a Next.js web application designed to manage network tunnels (specifically 6to4, ipip6, and gre6 types) on an Ubuntu 22 LTS server. It provides a user-friendly interface for adding, viewing, editing, and deleting tunnel configurations, and simulates the execution of the necessary backend commands.

## Features

*   **User Authentication:** Secure login to access the management panel.
*   **Dashboard:** Overview of all configured tunnels.
*   **Tunnel Management:**
    *   Add new tunnels (6to4, ipip6, gre6) with specific parameters like local/remote IPs, assigned interface IP (with CIDR), and MTU.
    *   Edit existing tunnel configurations.
    *   Delete tunnels.
    *   View tunnel details and status (active, inactive, error).
*   **Backend Simulation:** The backend service (`ubuntuTunnelService.ts`) simulates the Linux `ip tunnel` and `ip link` commands that would be run on an Ubuntu server. **Note:** Actual command execution is not implemented in this version and requires careful security considerations.

## Tech Stack

*   Next.js 15 (App Router)
*   React 18
*   TypeScript
*   Tailwind CSS
*   ShadCN UI Components
*   PM2 (for process management on the server)

## Server Installation (Ubuntu 22 LTS)

This project includes an `install.sh` script to automate the setup process on a fresh Ubuntu 22 LTS server.

### Prerequisites for Server Installation

*   An Ubuntu 22 LTS server.
*   A user account with `sudo` privileges.
*   Git and Curl (the script will attempt to install these if not present).

### Installation Steps

1.  **Clone the Repository:**
    Log into your Ubuntu server via SSH and clone this repository:
    ```bash
    git clone https://github.com/LiamHams/studio.git
    cd studio
    ```

2.  **Configure the Installation Script:**
    Before running the script, you **MUST** edit it to set your specific configuration:
    ```bash
    nano install.sh
    ```
    Inside the script, update the following variables at the top:
    *   `GITHUB_REPO_URL`: **Crucially, set this to your repository's HTTPS or SSH clone URL.** The script uses this to clone the project into a specified directory.
    *   `APP_CLONE_DIR`: The directory name where the project will be cloned (e.g., "tunnelvision-app").
    *   `PM2_APP_NAME`: The name for your application in PM2 (e.g., "tunnelvision").
    *   `APP_PORT`: The port your Next.js application will run on (e.g., "3000", "8080").
    *   `NODE_VERSION`: The Node.js LTS version to install via NVM (e.g., "20").

3.  **Change Default Credentials (Recommended BEFORE First Run):**
    The default credentials are `admin` / `password`. For security, change these before deploying or running the install script for the first time (if the script clones a version with these new credentials).
    Edit the file `src/lib/auth.ts`:
    ```typescript
    const HARDCODED_USER = 'your_new_admin_username';
    const HARDCODED_PASS = 'your_strong_password';
    ```
    If you change credentials *after* the `npm run build` step (which `install.sh` performs), you'll need to rebuild (`npm run build`) and restart PM2 (`pm2 restart your-app-name`).

4.  **Make the Script Executable:**
    ```bash
    chmod +x install.sh
    ```

5.  **Run the Installation Script:**
    ```bash
    ./install.sh
    ```
    The script will:
    *   Update package lists.
    *   Install `curl` and `git`.
    *   Install NVM (Node Version Manager).
    *   Install the specified Node.js LTS version and set it as default.
    *   Clone the project from the `GITHUB_REPO_URL` you configured (if it's not the directory you're already in).
    *   Install project dependencies using `npm install`.
    *   Build the Next.js application for production (`npm run build`).
    *   Install PM2 globally (if not already installed).
    *   Start the application with PM2 using the configured `PM2_APP_NAME` and `APP_PORT`.
    *   Configure PM2 to start on system boot.
    *   Configure UFW (firewall) to allow traffic on `APP_PORT` and SSH.

6.  **Access Your Application:**
    Once the script completes, you should be able to access TunnelVision at `http://<your_server_ip>:<APP_PORT>`. Log in with the configured credentials.

### Managing the Application with PM2

*   List processes: `pm2 list`
*   View logs: `pm2 logs <PM2_APP_NAME>`
*   Restart app: `pm2 restart <PM2_APP_NAME>`
*   Stop app: `pm2 stop <PM2_APP_NAME>`

## Local Development

1.  **Prerequisites:**
    *   Node.js (LTS version recommended - e.g., v20.x)
    *   npm (comes with Node.js)

2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002` (or the port specified in the `dev` script in `package.json`).

## Important Notes

*   **Security - Command Execution:** The `ubuntuTunnelService.ts` file currently **simulates** the execution of Ubuntu commands. To make this application actually manage tunnels on your server, you would need to replace the simulation logic with real command execution (e.g., using Node.js `child_process.exec`). This is a **HIGH-SECURITY RISK** and must be done with extreme caution:
    *   The user running the Next.js application would need appropriate `sudo` permissions, configured carefully via `sudoers` to limit command scope.
    *   All inputs used to construct commands **must** be rigorously sanitized and validated to prevent command injection vulnerabilities.
*   **Security - Credentials:** The default `admin`/`password` credentials are for demonstration only. **Change them immediately** if deploying to any environment other than a local, isolated test machine. Consider integrating a proper authentication database for a production system.
*   **Error Handling:** The application includes basic error handling, but further enhancements may be needed for a production environment.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
```
