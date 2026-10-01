# Backup host

The backup host is a second Ubuntu 24.04 VPS, at a different provider and in a different EU member state from the primary. It runs [rest-server](https://github.com/restic/rest-server), the HTTP backend for restic, and stores the primary host's restic repository. The primary encrypts every snapshot before upload, so this host only ever holds ciphertext.

## Layout

- `provision-backup-host.sh`: installs rest-server, its certificate, its htpasswd file and its firewall rule, and sets up the sftp-only login the operator workstation uses for the monthly prune. Run once as root; re-running converges.
- `rest-server.service`: the systemd unit the script installs to `/etc/systemd/system/`.

## What is not on this host

- No restic binary. Nothing here reads the repository.
- No repository password. It lives on the primary host in `/etc/care-y/` and in the backup key escrow file. Without it the files under `/srv/restic` cannot be read.
- No SSH key or other credential for the primary host, and the primary has none for this host. The primary reaches this host only through rest-server's HTTP API.

## rest-server flags

| Flag                                           | Effect                                                                                                                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--path /srv/restic`                           | Repository root, owned by the `restic` user, mode 0700.                                                                                                                                                       |
| `--listen :8000`                               | The only port the service opens.                                                                                                                                                                              |
| `--append-only`                                | Clients can add snapshots but cannot delete or overwrite existing data. The flag applies to the whole server, so no HTTP user is exempt from it. A compromised primary can add history but cannot destroy it. |
| `--private-repos`                              | Each htpasswd user can reach only the repository at `/<user>`, which is `/srv/restic/<user>` on disk.                                                                                                         |
| `--htpasswd-file /etc/restic-server/.htpasswd` | One bcrypt entry, for the primary host. rest-server refuses to start when the file cannot be opened.                                                                                                          |
| `--tls`, `--tls-cert`, `--tls-key`             | TLS with a self-signed certificate. The primary pins this certificate with restic's `--cacert`, so it trusts this one peer and no public CA. The host needs no domain name, no ACME and no port 80.           |

The unit runs rest-server as the `restic` user with the systemd hardening from the upstream example unit. The upstream example is socket-activated; this unit opens its own listener, so it keeps the host network.

## Firewall

The host runs the `deploy/provision` network script with `CAREY_SKIP_WEB_PORTS=1`, which opens SSH (22) only. `provision-backup-host.sh` then adds one rule: port 8000 open to the primary host's public IP address and to nothing else. It asks for that address on the terminal, or reads it from fd 4. The address never goes into this repository.

To change the primary's address, delete the old rule (`ufw status numbered`, then `ufw delete <number>`) and re-run the script.

## Prune access over sftp

The `--append-only` flag means rest-server never deletes anything, so retention has to bypass it. The operator runs `restic forget --prune` once a month from the operator workstation, using restic's sftp backend. That path goes straight to the files under `/srv/restic/<user>` and does not pass through rest-server. The procedure is in the backups runbook. It never runs from the primary host, and never from this host: the repository password must not sit next to the ciphertext.

The script sets up the `restic` user for this:

- The workstation's public key is the only key in `/home/restic/.ssh/authorized_keys`, prefixed with `restrict` (no forwarding, no pty, no `~/.ssh/rc`).
- An sshd drop-in adds `restic` to `AllowUsers` and has a `Match User restic` block with `ForceCommand internal-sftp`, `DisableForwarding yes` and `PermitTTY no`. A shell login as `restic` is refused with "This service allows sftp connections only."
- The home directory, `.ssh` and `authorized_keys` are owned by root, so an sftp session cannot add a key.
- The `restic` user has no password, no login shell and no supplementary groups.

Use a dedicated key for the prune, not a team key that already logs in as `carey-admin`.

## Running

On the workstation, generate the primary host's rest-server password (at least 32 characters, at most 72) and keep it in the team password manager. The primary host's `restic.env` carries the same value as `RESTIC_REST_PASSWORD`.

Copy `deploy/provision`, `deploy/backup/host` and the team key directory to the backup host, keeping the repository layout (`provision/`, `backup/host/` and `team-keys/` side by side). Then, as root:

```sh
bash provision/10-users-ssh.sh
CAREY_SKIP_WEB_PORTS=1 bash provision/20-network.sh
```

Run these two scripts only and skip `provision.sh`. This host runs no containers and holds no application secret, so it needs neither `30-memory-docker.sh` nor `40-secrets.sh`.

Write the rest-server password to a root-only file, then run the backup host script:

```sh
(umask 077; cat > /root/rest-password)    # paste the password, then Ctrl-D
CAREY_BACKUP_HTTP_USER=<user> \
CAREY_PRUNE_PUBKEY_FILE=<path to the workstation's public key file> \
  bash backup/host/provision-backup-host.sh 3< /root/rest-password
rm /root/rest-password
```

The script asks for the primary host's public IP address and, on the first run, for this host's public IP address, which goes into the certificate's subject alternative name. Pass them on fd 4 and fd 5 instead to skip the prompts. fd 3 is read only while `<user>` is missing from the htpasswd file.

At the end the script prints the certificate's SHA-256 fingerprint. Record it in the backups runbook. Copy `/etc/restic-server/cert.pem` to the primary host, where the backup client install places it at `/etc/care-y/backup-ca.pem`, and compare the fingerprint there:

```sh
openssl x509 -in /etc/care-y/backup-ca.pem -noout -fingerprint -sha256
```

The script generates the certificate once and keeps it on every re-run. It is valid for 10 years. Replacing it means copying the new file to the primary before the next nightly backup.

## Checks

Run these once after provisioning and record the results in the backups runbook.

From the primary host, with `restic.env` in place:

- `restic -r rest:https://<backup-host-ip>:8000/<user> --cacert /etc/care-y/backup-ca.pem init` succeeds.
- `restic forget --prune` against the same repository fails with a 403 from rest-server.

From the operator workstation:

- `sftp restic@<backup-host-ip>` opens an sftp session.
- `ssh restic@<backup-host-ip>` is refused with "This service allows sftp connections only."

CI runs `shellcheck` over the script together with every other script under `deploy/`.
