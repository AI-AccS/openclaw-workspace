# HMRC Call Automation System

This system automates HMRC calls to save team time by:
1. Making calls through your existing UCM6308 infrastructure
2. Handling HMRC automated prompts automatically
3. Transferring calls to team members when human agents are available
4. Integrating with your Google Sheets database for client information

## System Components

### 1. Voice Agent
- Uses ElevenLabs for speech synthesis and recognition
- Handles HMRC automated prompts and responses
- Provides natural voice interaction

### 2. UCM6308 Integration
- Leverages existing click-to-call functionality
- Manages call transfers to team members
- Integrates with your PBX system

### 3. Database Integration
- Connects to Google Sheets database
- Retrieves client information for HMRC calls
- Supports department selection

## Configuration

See config.json for system settings.

## Usage

The system is designed to be called from your team members who can:
1. Select the HMRC department they need to contact
2. Select the client they're contacting
3. System automatically makes the call with proper information