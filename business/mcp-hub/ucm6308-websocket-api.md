# UCM6308 WebSocket API Reference
*Source: https://documentation.grandstream.com/knowledge-base/ip-pbx-websocket-api-user-guide/

## WebSocket Connection

**URL Format:**
```
wss://[PBX_IP]:8089/websockify
```

**Examples:**
- Internal: `wss://192.168.1.148:8089/websockify`
- External: `wss://81.137.249.200:8089/websockify`

**Session Flow:**
1. Connect → 2. Challenge → 3. Login → 4. Subscribe → 5. Receive events → 6. Heartbeat → 7. Logout

---

## Authentication

### Challenge Request
```json
{
  "type": "request",
  "message": {
    "transactionid": "unique_id",
    "action": "challenge",
    "username": "cdrapi",
    "version": "1"
  }
}
```

**Response:**
```json
{
  "response": {"challenge": "0000001652831717"},
  "status": 0
}
```

### Login (MD5 hash of challenge + password)
```json
{
  "type": "request",
  "message": {
    "transactionid": "unique_id",
    "action": "login",
    "username": "cdrapi",
    "password": "md5_hash",
    "version": "1"
  }
}
```

---

## Core Session Management

**Heartbeat (every ~30s):**
```json
{"type": "request", "message": {"transactionid": "id", "action": "heartbeat"}}
```

**Logout:**
```json
{"type": "request", "message": {"transactionid": "id", "action": "logout"}}
```

---

## Event Subscription Pattern

**Subscribe:**
```json
{
  "type": "request",
  "message": {
    "transactionid": "id",
    "action": "subscribe",
    "eventnames": ["EventName1", "EventName2"]
  }
}
```

**Tiered subscription (specific entity):**
```json
{"eventnames": ["ExtensionStatus/1006"]}  // Single extension
{"eventnames": ["ExtensionStatus/1005~1007"]}  // Range
```

**Unsubscribe:** Same pattern with `action: "unsubscribe"`

---

## Event Notifications (Server → Client Push)

All events use this format:
```json
{
  "type": "request",
  "message": {
    "transactionid": "id",
    "action": "notify",
    "eventname": "EventTypeName",
    "eventbody": { ... }  // Event-specific data
  }
}
```

---

## Complete Event List

### 1. PbxStatus — PBX Metrics
Call counts, extensions, trunks, queues, meeting rooms
```json
{
  "eventname": "PbxStatus",
  "eventbody": {
    "calls_num": 3,
    "extension_register": 8,
    "meetroom_inuse": 1,
    "parking_inuse": 0,
    "available_trunk_number": 2,
    "queue_count": 3
  }
}
```

### 2. ExtensionStatus — Extension Lifecycle
Per-extension state changes (Idle/Ringing/Busy/Unavailable/InUse)
```json
{
  "eventname": "ExtensionStatus",
  "eventbody": [{
    "extension": "1002",
    "status": "Ringing",
    "addr": "192.168.124.168:5062"
  }]
}
```

### 3. ActiveCallStatus — Real-time Call Monitor
Full call lifecycle tracking with bridge/unbridge events
```json
{
  "eventname": "ActiveCallStatus",
  "eventbody": [{
    "action": "add",  // or update/delete
    "channel": "PJSIP/4000-000000d",
    "chantype": "bridge",
    "callerid1": "4000",
    "callerid2": "4001",
    "name1": "Extension 4000",
    "name2": "Bob Smith"
  }]
}
```

### 4. InterfaceStatus — Hardware Ports
FXS/FXO, LAN/WAN, PoE, Power, ISDN/PRI ports
```json
{
  "eventname": "InterfaceStatus",
  "eventbody": {
    "interface-fxs": [{"status": "InUse", "chan": 1}],
    "interface-network": {"LAN": "linked", "WAN": "linked"},
    "power-poe": 0
  }
}
```

### 5. TrunkStatus — SIP Trunk Health
```json
{
  "eventname": "TrunkStatus",
  "eventbody": [{
    "trunk_index": 6,
    "status": "Unregistered"  // or Reachable/Failed/etc
  }]
}
```

### 6. ConferenceForVideoStatus — Meeting Rooms
Participant count, mute status, join/leave events
```json
{
  "eventname": "ConferenceForVideoStatus",
  "eventbody": [{
    "attend_count": 2,
    "conf_number": "6302",
    "member": [{
      "action": "add",
      "member_number": "4001",
      "is_audio_muted": "yes"
    }]
  }]
}
```

### 7. VoiceMailStatus — Voicemail Updates
```json
{
  "eventname": "VoiceMailStatus",
  "eventbody": [{
    "extensions": "1000",
    "newmsg": 1,
    "urgemsg": 0,
    "oldmsg": 0
  }]
}
```

### 8. CallQueueStatus — Queue + Agents
Queue config, agent status (Paused/Available), waiting calls
```json
{
  "eventname": "CallQueueStatus",
  "eventbody": [{
    "extension": "6500",
    "member": [{
      "member_extension": "1004",
      "status": "Paused",
      "pause_reason": "Lunch"
    }]
  }]
}
```

### 9. EquipmentCapacityStatus — USB/SD Detection
```json
{
  "eventname": "EquipmentCapacityStatus",
  "eventbody": {
    "disk-total": [{"diskname": "sda1", "value": "14896"}],
    "disk-avail": [{"diskname": "sda1", "value": "5656"}]
  }
}
```

### 10. EventListStatus — Extension Event List
```json
{
  "eventname": "EventListStatus",
  "eventbody": [{
    "uri": "hytkiu",
    "member": [{"extension": "1005", "status": "terminated"}]
  }]
}
```

### 11. SCA Events — Shared Calling Account
- `ScaUserStatus` — SCA user state (Idle/InUse/Ringing)
- `ScaLineStatus` — Per-line status under shared number
- `ScaLineStatusClean` — Clear all lines for shared number

### 12. Email Status — Email Notifications
- `sendMailStatus` — Email send result (sent/bounced/reject)
- `EmailToUserStatus` — User notified of email

### 13. HA Status — High Availability
```json
{
  "eventname": "HaStatus",
  "eventbody": {
    "haOL": "1",  // Dual machine mode
    "bkp4web": "2"  // Primary backing up
  }
}
```

### 14. PMS Events — Hotel Property Management
- `PMSRoomStatus` — Check-in/out, guest name updates
- `PMSWakeupStatus` — Wake-up call execution/answer status

### 15. CRM User Status
```json
{
  "eventname": "CRMUserStatus",
  "eventbody": [{
    "extension": "1000",
    "user_name": "admin",
    "login_status": "login"
  }]
}
```

---

## MCP Hub Tools (WebSocket Layer)

**New tools added:**
- `ucm_websocket_connect` — Connect to wss://host:8089/websockify
- `ucm_websocket_auth` — Challenge-login handshake
- `ucm_websocket_subscribe` — Subscribe to event types
- `ucm_websocket_unsubscribe` — Unsubscribe
- `ucm_websocket_heartbeat` — Keep-alive
- `ucm_websocket_listen` — Stream events for N seconds
- `ucm_websocket_status` — Check session state
- `ucm_websocket_disconnect` — Clean shutdown

**Session management:**
Each connection gets a unique `sessionId` for all subsequent operations.
Sessions persist in memory until disconnected.

---

## Use Cases

1. **Real-time CDR logging** — Subscribe to ActiveCallStatus, log call lifecycle
2. **Extension dashboard** — ExtensionStatus + PbxStatus for live agent view
3. **Trunk health alerts** — TrunkStatus events → send Slack/email on failure
4. **Queue monitoring** — CallQueueStatus for call center metrics
5. **Conference bridge tracking** — ConferenceForVideoStatus for meeting analytics
6. **Voicemail notifications** — VoiceMailStatus → auto-forward to email/Teams
7. **Hardware monitoring** — InterfaceStatus + EquipmentCapacityStatus
