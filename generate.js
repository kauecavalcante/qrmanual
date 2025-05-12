// generate.js
const { generateQRCodeSVG } = require('./dist/index.js');
const fs = require('fs');

// texto ou URL que você quer codificar
const payload = 'https://exemplo.com';

// gera o SVG
const svg = generateQRCodeSVG(payload);

// salva num arquivo
fs.writeFileSync('qr.svg', svg, 'utf8');
console.log('QR Code salvo em qr.svg');
