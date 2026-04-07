#!/bin/bash

echo "🔐 Setting up HTTPS for Owl-talk..."

# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate
echo "📜 Generating SSL certificate..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Owl-talk/CN=owltalk.local" \
  -addext "subjectAltName=DNS:owltalk.local,DNS:*.owltalk.local,DNS:localhost,IP:127.0.0.1"

echo "✅ SSL certificate generated"
echo "📁 Certificate: ssl/cert.pem"
echo "📁 Key: ssl/key.pem"
echo ""
echo "🔓 You'll need to accept the certificate in your browser"
echo "   (Click 'Advanced' → 'Proceed to owltalk.local (unsafe)')"

