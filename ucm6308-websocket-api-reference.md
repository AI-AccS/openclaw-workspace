# Grandstream UCM6308 WebSocket API Reference

**Source:** https://documentation.grandstream.com/knowledge-base/ip-pbx-websocket-api-user-guide/
**Extracted:** 2026-03-06

## Connection Details

### Endpoint URL
```
wss://[PBX_IP]:8089/websockify
```

For our UCM6308 at 192.168.1.148:
```
wss://192.168.1.148:8089/websockify
```

### Transaction Headers
All requests require:
- Host header with IP:port
- Connection: Upgrade
- Upgrade: websocket
- Sec-WebSocket-Version: 13

## Authentication Flow

### Step 1: Challenge Request
```json
{
  "type": "request",
  "message": {
    "transactionid": "123456789zxa",
    "action": "challenge",
    "username": "<API_USERNAME>",
    "version": "1"
  }
}
```

**Response:**
```json
{
  "response": {
    "challenge": "0000001652831717"
  },
  "status": 0
}
```

⚠️ The `username` field must match the API username configured on the UCM6308.

### Step 2: Login Request
After receiving challenge, send login with generated cookie (HTTPS session cookies work too).

## Session Management

### Heartbeat (keep-alive)
```json
{
  "type": "request",
  "message": {
    "transactionid": "123456789zxe",
    "action": "heartbeat"
  }
}
```

**Response:**
```json
{
  "type": "response",
  "message": {
    "transactionid": "123456789zxe",
    "action": "heartbeat",
    "status": "0"
  }
}
```

### Logout
```json
{
  "type": "request",
  "message": {
    "transactionid": "123456789zxe",
    "action": "logout"
  }
}
```

## Event Subscriptions

### Subscribe to Events
```json
{
  "type": "request",
  "message": {
    "transactionid": "123456789zxc",
    "action": "subscribe",
    "eventnames": ["ExtensionStatus", "ConferenceStatus", "TrunkStatus"]
  }
}
```

**Successful Response:**
```json
{
  "type": "response",
  "message": {
    "transactionid": "123456789zxc",
    "action": "subscribe",
    "status": 0
  }
}
```

### Tiered Subscription (Specific Extensions)
```json
// Single extension 1006
{
  "type": "request",
  "message": {
    "transactionid": "123456789zx",
    "action": "subscribe",
    "eventnames": ["ExtensionStatus/1006"]
  }
}

// Range 1005-1007
{
  "type": "request",
  "message": {
    "transactionid": "123456789zx",
    "action": "subscribe",
    "eventnames": ["ExtensionStatus/1005~1007"]
  }
}
```

### Unsubscribe
```json
{
  "type": "request",
  "message": {
    "transactionid": "123456789zxd",
    "action": "unsubscribe",
    "eventnames": ["ExtensionStatus", "ConferenceStatus", "TrunkStatus"]
  }
}
```

## Key Event Types

### PbxStatus (System Health)
**Monitors:**
- `calls_num` - Current active calls
- `extension_register` - Number of registered extensions
- `meetroom_inuse` - Meeting rooms in use
- `parking_inuse` - Parking spaces in use
- `fail2ban` - Fail2Ban status ("yes"/"no")
- `dynamic_defense` - Dynamic Defense status
- `auto_clean` - Auto cleanup status
- `regular_backup` - Scheduled backup status
- Trunk availability metrics

**Example Event:**
```json
{
  "type": "request",
  "message": {
    "transactionid": "123456789zx",
    "action": "notify",
    "eventname": "PbxStatus",
    "eventbody": {
      "extension_register": 8,
      "fail2ban": "yes"
    }
  }
}
```

### ActiveCallStatus (Real-time Calls)
**Fields:**
- `uniqueid` - Channel identifier
- `state` - Channel status (Up, Ringing, etc.)
- `service` - Channel type
- `callername` / `callernum` - Caller ID info
- `connectedname` / `connectednum` - Connected peer
- `linkedid` - Linked channel ID (for transfers)

### InterfaceStatus (Hardware Ports)
**Monitors:**
- LAN/WAN network status (linked/unlink)
- FXS/FXO port status (Idle/InUse)
- PRI/ISDN port metrics
- PoE status
- Power port status
- USB storage detection

### ExtensionStatus (Extension Events)
**Fields:**
- `extension` - Extension number
- `status` - Registration state

## Event Notification Structure

All events pushed as:
```json
{
  "type": "request",
  "message": {
    "transactionid": "<TX_ID>",
    "action": "notify",
    "eventname": "<EventName>",
    "eventbody": <Object or Array>
  }
}
```

## Next Steps for MCP Hub

1. **Build WebSocket Client Module**
   - Implement connection to `wss://192.168.1.148:8089/websockify`
   - Handle authentication (challenge → login)
   - Maintain heartbeat keepalive

2. **Create Subscription Manager**
   - Subscribe to PbxStatus, ActiveCallStatus, InterfaceStatus
   - Handle incoming notifications
   - Expose as MCP tools for query + real-time alerts

3. **API Username Discovery Needed**
   - Current "Brigain" is SIP display name, NOT API username
   - Need actual admin credentials for web interface
   - API user may be different from SIP extension creds
