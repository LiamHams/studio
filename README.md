
# TunnelVision - Network Tunnel Management Panel

TunnelVision is a Next.js web application designed to manage network tunnels (specifically 6to4, ipip6, and gre6 types) on an Ubuntu 22 LTS server. It provides a user-friendly interface for adding, viewing, editing, and deleting tunnel configurations, and simulates the execution of the necessary backend commands.

## Features

*   **User Authentication:** Secure login to access the management panel. (Default: `admin`/`password`)
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
*   PM2 (for process management on the server, via `install.sh`)

## Server Installation (Ubuntu 22 LTS)

This project includes an `install.sh` script to automate the setup process on a fresh Ubuntu 22 LTS server.

### Prerequisites for Server Installation

*   An Ubuntu 22 LTS server.
*   A user account with `sudo` privileges.
*   Internet access for downloading packages and cloning the repository.

### Installation Steps

1.  **Log into your Ubuntu Server:**
    Use SSH to connect to your server.

2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/LiamHams/studio.git
    cd studio
    ```

3.  **Configure the Installation Script (Optional but Recommended):**
    The `install.sh` script has some default configurations. You might want to review or change them, especially `APP_PORT`.
    ```bash
    nano install.sh
    ```
    Inside the script, you can update these variables at the top if needed:
    *   `GITHUB_REPO_URL`: Already set to `https://github.com/LiamHams/studio.git`.
    *   `APP_CLONE_DIR`: Already set to `studio`.
    *   `PM2_APP_NAME`: Default is "tunnelvision".
    *   `APP_PORT`: Default is "3000". Change this if you need the app to run on a different port.
    *   `NODE_VERSION`: Default is "20" (LTS).

4.  **Change Default Credentials (Highly Recommended BEFORE First Production Run):**
    The default credentials are `admin` / `password`. For security, change these before deploying.
    Edit the file `src/lib/auth.ts`:
    ```typescript
    const HARDCODED_USER = 'your_new_admin_username';
    const HARDCODED_PASS = 'your_strong_password';
    ```
    If you change credentials *after* the `npm run build` step (which `install.sh` performs), you'll need to rebuild (`npm run build`) and restart PM2 (`pm2 restart your-app-name`). It's best to change them, commit, and push before running the install script on a production server.

5.  **Make the Script Executable:**
    ```bash
    chmod +x install.sh
    ```

6.  **Run the Installation Script:**
    ```bash
    ./install.sh
    ```
    The script will:
    *   Update package lists.
    *   Install `curl` and `git`.
    *   Install NVM (Node Version Manager).
    *   Install the specified Node.js LTS version and set it as default.
    *   Navigate into the project directory (it handles being run from inside or outside).
    *   Install project dependencies using `npm install`.
    *   Build the Next.js application for production (`npm run build`).
    *   Install PM2 globally (if not already installed).
    *   Start the application with PM2 using the configured `PM2_APP_NAME` and `APP_PORT`.
    *   Configure PM2 to start on system boot.
    *   Configure UFW (firewall) to allow traffic on `APP_PORT` and SSH.
    *   Attempt to display the server's IP and the application URL.

7.  **Access Your Application:**
    Once the script completes, it will attempt to show you the URL. You should be able to access TunnelVision at `http://<your_server_ip>:<APP_PORT>`. Log in with the configured credentials (default: `admin`/`password`).

### Managing the Application with PM2

*   List processes: `pm2 list`
*   View logs: `pm2 logs <PM2_APP_NAME>` (e.g., `pm2 logs tunnelvision`)
*   Restart app: `pm2 restart <PM2_APP_NAME>`
*   Stop app: `pm2 stop <PM2_APP_NAME>`

## Local Development

1.  **Prerequisites:**
    *   Node.js (LTS version recommended - e.g., v20.x, same as `NODE_VERSION` in `install.sh`)
    *   npm (comes with Node.js)

2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/LiamHams/studio.git
    cd studio
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
*   **Security - Credentials:** The default `admin`/`password` credentials are for demonstration/development only. **Change them immediately** by editing `src/lib/auth.ts`, rebuilding, and restarting the app if deploying to any environment other than a local, isolated test machine. Consider integrating a proper authentication database for a production system.
*   **Error Handling:** The application includes basic error handling, but further enhancements may be needed for a production environment.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
