#!/usr/bin/env python3
"""Copy a file to a Proxmox VM via qm guest exec (chunked base64)."""
import subprocess, sys, base64, os

VMID = sys.argv[1]
LOCAL_PATH = sys.argv[2]
REMOTE_PATH = sys.argv[3] if len(sys.argv) > 3 else os.path.basename(LOCAL_PATH)
HOST = "192.168.0.95"
PASS = "mcp"

CHUNK_SIZE = 768 * 1024  # ~750KB raw → ~1MB base64

def ssh_qm(cmd):
    full = f"sshpass -p {PASS} ssh -o StrictHostKeyChecking=no mcp@{HOST} sudo /usr/sbin/qm guest exec {VMID} -- bash -c {shq(cmd)}"
    r = subprocess.run(full, shell=True, capture_output=True, text=True, timeout=120)
    return r.returncode, r.stdout, r.stderr

def shq(s):
    return "'" + s.replace("'", "'\\''") + "'"

# First: create remote dir
rc, out, err = ssh_qm(f"mkdir -p {os.path.dirname(REMOTE_PATH)} && echo DIR_OK")
if "DIR_OK" not in out:
    print(f"Failed to create remote dir: {err}", file=sys.stderr)
    sys.exit(1)

total = os.path.getsize(LOCAL_PATH)
written = 0

with open(LOCAL_PATH, "rb") as f:
    while True:
        chunk = f.read(CHUNK_SIZE)
        if not chunk:
            break
        encoded = base64.b64encode(chunk).decode()
        chunk_id = written // CHUNK_SIZE + 1
        print(f"Chunk {chunk_id} ({len(encoded)} base64 chars)...", file=sys.stderr)
        
        # Use python3 on remote to decode and append
        cmd = f"python3 -c 'import base64, sys; sys.stdout.buffer.write(base64.b64decode(sys.stdin.read()))' >> {REMOTE_PATH}"
        full = f"echo {shq(encoded)} | sshpass -p {PASS} ssh -o StrictHostKeyChecking=no mcp@{HOST} sudo /usr/sbin/qm guest exec {VMID} -- bash -c {shq(cmd)}"
        rc = subprocess.run(full, shell=True, capture_output=True, text=True, timeout=300)
        if rc.returncode != 0:
            print(f"Chunk {chunk_id} failed: {rc.stderr}", file=sys.stderr)
            sys.exit(1)
        written += len(chunk)
        print(f"  Progress: {written}/{total} bytes ({100*written//total}%)", file=sys.stderr)

# Verify
rc, out, err = ssh_qm(f"wc -c < {REMOTE_PATH}")
actual = int(out.strip().split('\n')[-1].strip() or 0)
if actual == total:
    print(f"SUCCESS: {REMOTE_PATH} = {actual} bytes")
else:
    print(f"MISMATCH: expected {total}, got {actual}", file=sys.stderr)
    sys.exit(1)
