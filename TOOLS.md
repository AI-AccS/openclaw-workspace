# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Network Setup

**MSI PC:**
- IP: `192.168.1.245`
- Hostname: MSI

### UCM6308 VoIP Server

- Internal IP: `192.168.1.148` ← **use this when on the same network as MSI**
- BT Static Public IP: `81.137.249.200`
- SIP Hostname: `tel.scot.ltd` (DNS A record → public IP)
- Web UI port: 8080 (external) / 80 (internal)

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
