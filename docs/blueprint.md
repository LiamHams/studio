# **App Name**: TunnelVision

## Core Features:

- Automatic Tunnel Detection: Automatically detect and display existing 6to4 and IPv6 tunnels on the server.
- Add Tunnel: Add new tunnels by entering tunnel details through a form, which then executes shell commands to create the tunnel.
- Edit Tunnel: Edit existing tunnel parameters and update the configuration accordingly through a web form.
- Delete Tunnel: Delete selected tunnels safely through a delete button beside each tunnel entry.
- Secure Access: Secure the web panel with HTTP basic authentication, running on a non-default port, and optionally supporting SSL/TLS.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082), evoking stability and network depth.
- Background color: Light Gray (#F0F0F0), for a clean and neutral backdrop.
- Accent color: Soft Violet (#8A2BE2), used to highlight interactive elements and calls to action.
- Clean and monospaced font for tunnel configurations display.
- Simple, card-based layout to display the list of tunnels, making the information easy to parse and digest.
- Use a loading animation when applying new configurations.