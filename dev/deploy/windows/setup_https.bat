@echo off
REM Generate SSL certificates for HTTPS
echo Creating SSL certificates for HTTPS...

REM Create ssl directory
if not exist "ssl" mkdir ssl

REM Check if OpenSSL is available
where openssl >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo OpenSSL not found. Creating self-signed certificate with Python...
    echo.
    
    REM Generate certificate using Python
    python -c ^
    "from cryptography import x509; ^
    from cryptography.x509.oid import NameOID; ^
    from cryptography.hazmat.primitives import hashes; ^
    from cryptography.hazmat.primitives.asymmetric import rsa; ^
    from datetime import datetime, timedelta; ^
    import os; ^
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048); ^
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COUNTRY_NAME, 'US')]); ^
    cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(datetime.utcnow()).not_valid_after(datetime.utcnow() + timedelta(days=365)).sign(key, hashes.SHA256()); ^
    os.makedirs('ssl', exist_ok=True); ^
    open('ssl/key.pem', 'wb').write(key.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8, encryption_algorithm=serialization.NoEncryption())); ^
    open('ssl/cert.pem', 'wb').write(cert.public_bytes(encoding=serialization.Encoding.PEM)); ^
    print('Certificate created successfully')" 2>nul
    
    if %errorLevel% neq 0 (
        echo.
        echo Creating simple certificate without cryptography...
        echo.
        REM Fallback: create empty certificates (will use HTTP)
        echo Placeholder SSL certificate > ssl\cert.pem
        echo Placeholder SSL key > ssl\key.pem
        echo.
        echo Note: For full HTTPS support, install OpenSSL or Python cryptography library
        echo       Run: pip install cryptography
        echo.
    )
) else (
    echo Using OpenSSL to create certificate...
    echo.
    
    REM Generate private key
    openssl genrsa -out ssl\key.pem 2048
    
    REM Generate self-signed certificate
    openssl req -new -x509 -key ssl\key.pem -out ssl\cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Owl-talk/CN=localhost"
    
    echo.
    echo [OK] SSL certificates created successfully
)

echo.
echo Certificate files created in: ssl\
echo.

