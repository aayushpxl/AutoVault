const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

// Define certificate attributes
const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'NP' },
    { name: 'organizationName', value: 'AutoVault Dev' },
    { shortName: 'OU', value: 'Development' }
];

// Generate certificate with options
const options = {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
        {
            name: 'basicConstraints',
            cA: true
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                {
                    type: 2, // DNS
                    value: 'localhost'
                },
                {
                    type: 7, // IP
                    value: '127.0.0.1'
                }
            ]
        }
    ]
};

console.log('🔐 Generating self-signed SSL certificate...');

// Generate certificate with options
(async () => {
    try {
        const pems = await selfsigned.generate(attrs, options);
        console.log('DEBUG: pems object:', pems);

        // Create certs directory if it doesn't exist
        const certsDir = path.join(__dirname, 'certs');
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir);
            console.log('✅ Created certs directory');
        }

        // Write certificate and key to files
        const certPath = path.join(certsDir, 'cert.pem');
        const keyPath = path.join(certsDir, 'key.pem');

        // Write files with explicit encoding
        fs.writeFileSync(keyPath, String(pems.private), 'utf8');
        fs.writeFileSync(certPath, String(pems.cert), 'utf8');

        console.log('✅ SSL Certificate generated successfully!');
        console.log(`📄 Certificate: ${certPath}`);
        console.log(`🔑 Private Key: ${keyPath}`);
        console.log('');
        console.log('⚠️  IMPORTANT: This is a self-signed certificate for development only.');
        console.log('   Your browser will show a security warning that you need to accept.');
        console.log('   For production, use proper SSL certificates from a trusted CA.');
    } catch (error) {
        console.error('❌ Error writing certificate files:', error.message);
        console.error('Debug info:', error);
        process.exit(1);
    }
})();

