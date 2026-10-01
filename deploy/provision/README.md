# Host provisioning

Bash scripts that turn a fresh Ubuntu 24.04 server with LUKS full-disk encryption into a hardened CARE-Y host. They configure the operating system only. Nothing here creates the server at the provider or deploys the application.

## Layout

- `installimage/setup.conf.example`: installimage configuration for the encrypted install from the Hetzner rescue system. Placeholder passphrase only; the real file is assembled on the rescue system and never committed.
- `installimage/post-install.sh`: runs once inside the new system during installimage and adds Dropbear to the initramfs, so the disk can be unlocked over SSH on port 2222.
- `lib.sh`: shared settings and helpers, sourced by every other script. Host parameters (user names, the service uid, ports, paths) live at the top of this file and nowhere else.
- `dropbear-keys.sh`: `sync` applies the team public-key set to the initramfs and verifies the rebuilt image; `list` reads the registered keys back from the boot initramfs.
- `provision.sh`: runs the numbered scripts in order, then `99-verify.sh`.
- `10-users-ssh.sh`: the `care-y` service user (uid 1001, no shell, no sudo) and the `carey-admin` operator (SSH key only, sudo with a password), plus the sshd hardening drop-in.
- `20-network.sh`: UFW (22, 80 and 443 open), Fail2ban for sshd, security-only unattended upgrades with automatic reboots off.
- `30-memory-docker.sh`: core dumps disabled at every layer, swap on zram only, Docker Engine from Docker's apt repository with a daemon-wide core limit of 0.
- `40-secrets.sh`: creates `/etc/care-y/secrets.env` (mode 0600, owned by `care-y`) with a new `OPS_SECRETS_KEY`. Refuses to overwrite an existing file.
- `validate-secrets.sh`: checks the secrets file's permissions and format without printing any value.
- `99-verify.sh`: one `PASS` or `FAIL` line per host assertion; exits nonzero when any check fails.

## Team keys

`dropbear-keys.sh sync` and `10-users-ssh.sh` read the same directory of public keys: every `*.pub` file in it, one key per line (`ssh-ed25519`, `ecdsa-sha2-*` or `ssh-rsa`, no options). By default the scripts look for `../team-keys` next to this directory; set `CAREY_TEAM_KEYS_DIR` to use another path. The set must hold at least two distinct keys; with one key, losing it would lock the team out. Keep the key set in a private repository; public keys identify the people who can reach the host.

## Running

Copy this directory and the team key directory to the host side by side, then run as root from an interactive terminal:

```sh
bash provision/dropbear-keys.sh sync
bash provision/provision.sh
```

`10-users-ssh.sh` disables root login over SSH. Keep the first session open until a fresh login as `carey-admin` works.

Re-running any script converges on the same state. `40-secrets.sh` leaves an existing secrets file untouched.

## Checks

`bash -n` covers syntax locally. CI runs the runner's preinstalled `shellcheck` over every script in this directory.
