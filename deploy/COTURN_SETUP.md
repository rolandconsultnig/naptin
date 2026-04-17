# Coturn Setup For NAPTIN Chat

## 1) Configure coturn

Edit `deploy/coturn.turnserver.conf`:

- Set `external-ip` to your server's public IP.
- Set a strong secret in `user=naptin-turn-user:<secret>`.
- If you use TLS, set `cert` and `pkey`.

## 2) Start coturn

From repo root:

```powershell
Set-Location E:\projects\NAPTIN\deploy
docker compose -f coturn.docker-compose.yml up -d
```

Open firewall/security group:

- UDP/TCP `3478`
- TCP `5349` (if using `turns:`)

## 3) Wire to frontend

In repo root `.env` add:

```env
VITE_CHAT_TURN_URLS=turn:YOUR_SERVER_DNS_OR_IP:3478,turns:YOUR_SERVER_DNS_OR_IP:5349
VITE_CHAT_TURN_USERNAME=naptin-turn-user
VITE_CHAT_TURN_CREDENTIAL=replace-with-strong-secret
```

Optional custom STUN list:

```env
VITE_CHAT_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
```

Restart Vite after changing `.env`.

## 4) Verify

- Open two clients on different networks (or one on mobile data, one on office Wi-Fi).
- Start audio/video call.
- In browser devtools, inspect `RTCPeerConnection` stats and ensure relay candidates (`typ relay`) appear when direct path fails.
