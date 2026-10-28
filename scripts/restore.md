# Restore (rehearse once before launch)

1. Stop the site: `docker compose stop site` (or stop the node process).
2. Copy the chosen backup folder to the server.
3. `cp <backup>/matador.db /data/matador.db`
4. `tar -xzf <backup>/media.tgz -C /data` (creates /data/media)
5. Start: `docker compose start site`, then open `/health` (must say ok) and `/hy`.
