# Self-hosting CARE-Y (single-tenant)

How to deploy CARE-Y for one organization on your own server. The system runs as a set of Docker containers behind Caddy, which terminates TLS with a wildcard certificate from Let's Encrypt.

## Prerequisites

| Requirement   | Minimum                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Server        | Ubuntu 24.04 (x86_64), 2 vCPU, 4 GB RAM, 40 GB disk, public IPv4                                               |
| Docker Engine | Docker CE with the compose plugin (v2)                                                                         |
| Domain        | A domain you control, on a DNS provider that Caddy supports for DNS-01 challenges (Cloudflare, Route 53, etc.) |
| TLS           | A DNS API token scoped to the domain's zone (read zone, edit DNS records)                                      |

The server must be provisioned and hardened before this guide applies. Full-disk encryption and the secrets file layout are covered separately.

Commands on the server run from an operator account that has `sudo` rights but is not in the `docker` group, so every `docker compose` command runs with `sudo` from `/opt/care-y`.

## DNS records

Create two A records pointing at the server's IPv4 address, both with DNS only (no proxy, no CDN):

| Type | Name         | Value       |
| ---- | ------------ | ----------- |
| A    | `<domain>`   | Server IPv4 |
| A    | `*.<domain>` | Server IPv4 |

The apex record serves the static landing page and webhook endpoints. The wildcard record routes each organization's subdomain to the application.

### CAA records

CAA records restrict which certificate authorities can issue certificates for the domain. Add the authorities Caddy uses by default:

| Type | Name       | Value                       |
| ---- | ---------- | --------------------------- |
| CAA  | `<domain>` | `0 issue "letsencrypt.org"` |
| CAA  | `<domain>` | `0 issue "sectigo.com"`     |

After the first successful certificate issuance, tighten the records with `accounturi` to bind them to your ACME account. The ACME account URI appears in Caddy's certificate storage (the `caddy_data` volume, under `acme/`).

## Files on the server

All paths below are on the production server. Modes and ownership matter: the application refuses to start when the secrets file is readable by group or others.

### `/etc/care-y/secrets.env`

The application secrets file. One `KEY=VALUE` per line, no quotes, no spaces around `=`. The secrets provisioning procedure covers its creation and format in full.

After provisioning creates the file with `OPS_SECRETS_KEY`, append the database URL:

```
DATABASE_URL=postgresql://carey:<db-password>@db:5432/carey
```

The password is the same one written to `/etc/care-y/db_password`. The hostname `db` is the compose service name, reachable only on the internal network.

### `/etc/care-y/db_password`

A single line: the Postgres password, generated with at least 32 random characters. Mode `0600`, owned by `root`. The database container reads it through a compose secret.

### `/etc/care-y/caddy.env`

Caddy's credentials. Mode `0600`, owned by `root`. The application containers never see this file.

| Key                | Value                                         |
| ------------------ | --------------------------------------------- |
| `CF_API_TOKEN`     | DNS API token scoped to the domain's zone     |
| `CADDY_ACME_EMAIL` | Contact address for the ACME account          |
| `CADDY_ACME_CA`    | ACME directory URL (see "First deploy" below) |

For the Cloudflare DNS plugin, the token needs `Zone.Zone:Read` and `Zone.DNS:Edit` permissions, with zone resources limited to the application domain.

### `/etc/care-y/oprf/`

Two OPRF key share files, one per sidecar. Mode `0700` on the directory (owned by `root:root`), mode `0600` on each file (owned by uid 2001, the OPRF container user).

| File           | Container |
| -------------- | --------- |
| `oprf-a.share` | `oprf-a`  |
| `oprf-b.share` | `oprf-b`  |

Generate both shares with the `generate-oprf-shares.ts` script inside the API container. Each sidecar receives only its own share file through a bind mount. The full key exists only during the generation step and is not stored anywhere on the running system.

### `/opt/care-y/`

The working directory for the compose stack, owned by `root`:

| Path                      | Content                                           |
| ------------------------- | ------------------------------------------------- |
| `docker-compose.prod.yml` | The production compose file                       |
| `prod.env`                | Non-secret settings (below)                       |
| `deploy/caddy/Caddyfile`  | Caddy's configuration                             |
| `static/apex.html`        | The static landing page served at the apex domain |
| `canary/`                 | The warrant canary directory (below)              |

Copy `docker-compose.prod.yml`, `deploy/caddy/Caddyfile` and `static/apex.html` from the repository at the release you deploy, keeping those relative paths. The compose file bind-mounts the Caddyfile and the apex page from them, and Caddy does not start while either is missing. Each deploy refreshes all three files from the API image with `docker cp`, which needs `deploy/caddy/` and `static/` to exist already.

The deploy scripts are not kept here. Provisioning installs them as `/usr/local/bin/care-y-deploy` and `/usr/local/bin/care-y-deploy-root`.

`prod.env` holds the non-secret settings the compose file substitutes:

| Key                     | Purpose                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `GHCR_OWNER`            | Owner of the image repositories on the container registry (lowercase)     |
| `IMAGE_TAG`             | The 40-character commit SHA of the running release                        |
| `CAREY_APEX_HOST`       | The bare domain (e.g. `example.org`)                                      |
| `CAREY_APP_DOMAIN`      | The domain org subdomains hang off (normally the same as the apex)        |
| `WEBHOOK_BASE_URL`      | `https://<apex host>`, the base URL telephony providers call              |
| `INTAKE_POW_DIFFICULTY` | Proof-of-work difficulty for the public intake form, in leading zero bits |

### `/opt/care-y/canary/`

An empty directory, mode `0755`. Caddy serves `/canary` from it. The route returns 404 until the operator places a `canary.txt` file inside.

## First deploy

### Package visibility

After the first release has published its images and before the first deploy runs, check that the server can pull them. The deploy script pulls with no registry login, so the server can pull only packages that anyone can read. Package visibility is not inherited from the repository automatically and must be checked. GitHub creates a newly published package as private, and a package linked to a repository takes the repository's access permissions but not its visibility.

On GitHub, open the Packages page of the `GHCR_OWNER` account, then open each of the four packages (`care-y-api`, `care-y-web`, `care-y-caddy`, `care-y-oprf`) in turn and confirm its visibility is Public. If a package is private, change it in the package settings under "Danger Zone", "Change visibility". A package made public cannot be made private again.

For a private fork, leave the packages private and log the server in to the registry as root instead. Use a read-only token, a personal access token (classic) with only the `read:packages` scope. Keep the token in a root-only file and never put it in `prod.env`, whose contents are not treated as secret. Write the token as a single line, then set ownership and mode:

```sh
sudo nano /etc/care-y/ghcr-token
sudo chown root:root /etc/care-y/ghcr-token
sudo chmod 0600 /etc/care-y/ghcr-token
```

Log in as root, reading the token from the file so it stays off the command line. `<token-user>` is the GitHub account that owns the token:

```sh
sudo sh -c 'docker login ghcr.io -u <token-user> --password-stdin </etc/care-y/ghcr-token'
```

### ACME directory

Set `CADDY_ACME_CA` in `/etc/care-y/caddy.env` to the Let's Encrypt staging directory for the first attempt:

```
CADDY_ACME_CA=https://acme-staging-v02.api.letsencrypt.org/directory
```

Staging certificates are not trusted by browsers, but they prove the DNS challenge works without risking Let's Encrypt's production rate limits, which can block issuance for up to a week on repeated failures.

Once the staging certificate is issued and the application answers on all expected routes, switch to the production directory:

```
CADDY_ACME_CA=https://acme-v02.api.letsencrypt.org/directory
```

Restart Caddy for the change to take effect.

## Creating an organization

Provision a new org from the API container:

```sh
cd /opt/care-y
sudo docker compose --env-file prod.env -f docker-compose.prod.yml exec api \
  pnpm --filter @care-y/server exec tsx src/cli/org-create.ts <slug>
```

The command prints a one-time setup URL. The first person to visit it becomes the org's administrator. If the link is lost before anyone uses it, generate a new one:

```sh
cd /opt/care-y
sudo docker compose --env-file prod.env -f docker-compose.prod.yml exec api \
  pnpm --filter @care-y/server exec tsx src/cli/org-reset-token.ts <slug>
```

Token regeneration is refused once the org has any active user. The org is then reachable at `https://<slug>.<domain>`.

Concurrent provisioning of multiple orgs is supported.

## Updating

A release is a semver-tagged commit on `main`. The deploy sequence: pull the new images by SHA, refresh the compose file and Caddyfile from the API image, run database migrations across all tenant schemas, then restart the containers.

Each release publishes four images to the container registry, `care-y-api`, `care-y-web`, `care-y-caddy` and `care-y-oprf`, each tagged with both the commit SHA and the version. The two OPRF sidecars run the same `care-y-oprf` image with different share files.

The deploy script on the host handles this as a single command:

```sh
sudo /usr/local/bin/care-y-deploy-root deploy <40-character commit sha>
```

The script updates `IMAGE_TAG` in `prod.env`, pulls the images, runs the migrations and brings the new containers up. It verifies the apex page answers over TLS and the API health endpoint responds before finishing.

The full output of every run is appended to `/var/log/care-y/deploy.log` (directory mode `0700`, file mode `0600`, both owned by `root`). The command itself prints one summary line, `deploy <sha>: ok` on success or `deploy <sha>: failed at <step>` on failure. Read the log for the details:

```sh
sudo tail -n 100 /var/log/care-y/deploy.log
```

## Rollback

Run the deploy command with the previous release's commit SHA:

```sh
sudo /usr/local/bin/care-y-deploy-root deploy <previous sha>
```

Rollback is safe only across releases with no database migration between them. When a release includes a migration, rolling back leaves the schema at the newer version while the code expects the older one. Check the release notes for migration changes before rolling back.

## Architecture

```
Internet
  │
  ├─ :80, :443 ──▶ Caddy (TLS termination, routing, rate limiting)
  │                   │
  │                   ├──▶ web (SvelteKit, adapter-node, port 3001)
  │                   ├──▶ api (tRPC server, port 3000)
  │                   └──▶ static apex page, canary, webhooks ──▶ api
  │
  └─ (no other published ports)

Internal network only:
  api ──▶ db (PostgreSQL 16)
  api ──▶ oprf-a, oprf-b (threshold OPRF sidecars, Unix sockets)
```

Caddy is the only container with published ports. Every other service communicates over the compose internal network and is not reachable from outside the host. The database publishes no port. The OPRF sidecars communicate with the API through Unix sockets on a shared tmpfs volume, and each sidecar holds only its own key share.

All encryption and decryption happens in the browser. The server stores only ciphertext and cannot read the data it holds.
