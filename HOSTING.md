# WCI Digging & Excavation -- Hosting Guide

Everything you need to keep this site running, all in one place.

## Project Structure

```
WCI-Website/
├── index.html              # Main website (HTML, CSS, and JS all in one)
├── docker-compose.yml      # Starts the whole site with one command
├── .gitignore
├── LICENSE
├── README.md               # Codeberg project page
├── HOSTING.md               # This file (your hosting reference)
├── images/
│   ├── WCI Logo Side.webp
│   ├── WCI Logo.webp
│   ├── aboutus.jpg
│   ├── embed.jpg
│   ├── favicon.png
│   ├── thumbnail.jpg
│   └── jobs/               # Gallery photos (10 images)
├── css/
│   └── style.css
└── js/
    └── main.js
```

---

## Docker Setup (Fresh Server)

### Install Docker
```bash
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Log out and back in (or run `newgrp docker`) so your user can use Docker without sudo.

### Verify it works
```bash
docker --version
docker compose version
docker run hello-world
```

---

## Run the Site

```bash
docker compose up -d --build
```

Check it's running:
```bash
curl http://localhost:8080
```

### Other commands

| What you want | Command |
|---|---|
| Stop the site | `docker compose down` |
| Rebuild after changes | `docker compose up -d --build` |
| View live logs | `docker compose logs -f` (Ctrl+C to exit) |

---

## Making Changes

Edit `index.html` or swap images in `images/`, then:
```bash
docker compose up -d --build
```

Changes appear instantly -- no need to restart anything else.

---

## Cloudflare Tunnel

The site uses a Cloudflare tunnel so no ports need to be open on your router. Cloudflare handles SSL automatically.

### Install cloudflared
```bash
# Arch / CachyOS
sudo pacman -S cloudflared

# Ubuntu / Debian
# curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
# sudo dpkg -i cloudflared.deb
```

### Login
```bash
cloudflared tunnel login
```

### Create the tunnel
```bash
cloudflared tunnel create wci-website
```
Note the tunnel ID it gives you.

### Configure it
```bash
nano ~/.cloudflared/config.yml
```
```yaml
tunnel: wci-website
credentials-file: /home/YOUR_USERNAME/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:8080
  - hostname: www.yourdomain.com
    service: http://localhost:8080
  - service: http_status:404
```
Replace `YOUR_USERNAME` and `TUNNEL_ID` with your actual values.

### Route DNS
```bash
cloudflared tunnel route dns wci-website yourdomain.com
cloudflared tunnel route dns wci-website www.yourdomain.com
```

### Install as a system service
```bash
sudo mkdir -p /etc/cloudflared
sudo ln -sf ~/.cloudflared/config.yml /etc/cloudflared/config.yml
sudo ln -sf ~/.cloudflared/TUNNEL_ID.json /etc/cloudflared/TUNNEL_ID.json
sudo cloudflared service install
```

### Start it
```bash
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

Look for "Registered tunnel connection" 4 times in the status output.

### Enable auto-start on boot
```bash
sudo systemctl enable cloudflared
```

---

## Tunnel Operations

| What you want | Command |
|---|---|
| Restart the tunnel | `sudo systemctl restart cloudflared` |
| Check tunnel status | `sudo systemctl status cloudflared` |
| View tunnel logs | `sudo journalctl -u cloudflared -f` |
| Edit tunnel config | `nano ~/.cloudflared/config.yml` then restart tunnel |

---

## Verify Everything Is Live

1. **Docker**: `curl http://localhost:8080` -- should return HTML
2. **Tunnel**: `sudo systemctl status cloudflared` -- should show active
3. **DNS**: Cloudflare dashboard > DNS > Records -- both records should have the orange cloud (proxy) icon
4. **Browser**: Visit `https://wci-dig.com`

DNS may take 1-2 minutes to propagate.

---

## Troubleshooting

| Problem | Most likely cause | Fix |
|---|---|---|
| "This site can't be reached" | Tunnel stopped | `sudo systemctl start cloudflared` |
| Browser shows old version | Docker cached old build | `docker compose up -d --build` |
| Tunnel won't start | Config in wrong place | Config must be in `/etc/cloudflared/` |
| Port 8080 in use | Another service on that port | Change `8080:80` to `9090:80` in `docker-compose.yml`, update tunnel config, restart both |
| DNS not resolving | Records missing or not proxied | Check Cloudflare dashboard > DNS |

---

## Adding Another Site to This Server

1. Create a new folder with its own `docker-compose.yml` on a different port (e.g., 9090)
2. Add to `~/.cloudflared/config.yml`:
   ```yaml
     - hostname: newsite.com
       service: http://localhost:9090
   ```
3. Route DNS: `cloudflared tunnel route dns wci-website newsite.com`
4. Restart the tunnel: `sudo systemctl restart cloudflared`

---

## Start Over (Nuclear Option)

```bash
docker compose down
sudo systemctl stop cloudflared
docker compose up -d --build
sudo systemctl start cloudflared
```

---

*Built for WCI Digging & Excavation. Website by DeSynkro.*
