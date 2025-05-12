# qrmanual

[![npm version](https://img.shields.io/npm/v/qrmanual.svg)](https://www.npmjs.com/package/qrmanual) [![build status](https://github.com/kauecavalcante/qrmanual/actions/workflows/ci.yml/badge.svg)](https://github.com/kauecavalcante/qrmanual/actions)

**qrmanual** is a **TypeScript** library for generating fully programmatic QR Codes conforming to **Version 2 - Level L** (25×25 modules, low error correction) without any external dependencies.

---

## 🚀 Features

* **Byte Mode** (UTF-8) encoding with terminator and padding handling
* Data and **ECC** (10 bytes) **codewords** generation via **Reed–Solomon** over Galois Field GF(256)
* Construction of a 25×25 matrix with **Finder Patterns**, **Alignment Pattern**, **Timing Pattern**, **Format Information** and application of **Mask 0**
* Direct scalable **SVG** output
* Modular API: import only what you need (`encoder`, `matrix`, `svg`)

---

## 📦 Installation

Install via npm or Yarn:

```bash
npm install qrmanual
# or
yarn add qrmanual
```

---

## 💡 Usage Examples

### Node.js (CommonJS)

```js
const { generateQRCodeSVG } = require('qrmanual');
const fs = require('fs');

const payload = 'https://example.com';
const svg = generateQRCodeSVG(payload);

fs.writeFileSync('qr.svg', svg, 'utf8');
console.log('QR Code saved to qr.svg');
```

### TypeScript (ES Modules)

```ts
import { generateQRCodeSVG } from 'qrmanual';
import { writeFileSync } from 'fs';

const svg = generateQRCodeSVG('Hello, world!');
writeFileSync('qr.svg', svg, 'utf8');
console.log('QR Code generated: qr.svg');
```

### Browser (ES Modules)

```html
<div id="qr"></div>
<script type="module">
  import { generateQRCodeSVG } from 'qrmanual';
  document.getElementById('qr').innerHTML = generateQRCodeSVG('https://example.com');
</script>
```

---

## 🛠️ API Reference

| Function                   | Signature                                        | Description                                                       |
| -------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `encodePayloadToCodewords` | `(payload: string) => number[]`                  | Returns **44 codewords** (34 data + 10 ECC) for the given text    |
| `buildMatrix`              | `(codewords: number[]) => (0\|1)[][]`            | Builds the **25×25 matrix** of modules (0 = white, 1 = black)     |
| `renderSVG`                | `(matrix: (0\|1)[][], scale?: number) => string` | Converts a matrix to an **SVG string**. Adjust `scale` as needed. |
| `generateQRCodeSVG`        | `(payload: string) => string`                    | Full pipeline: encodes, builds matrix, and returns **SVG**        |

> **Default mask:** always uses **Mask 0**. To support other masks or error levels, please modify the modules or submit a PR.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. `git clone https://github.com/kauecavalcante/qrmanual.git`
3. `npm install`
4. `npm run build` to compile
5. `npm test` to run tests
6. Open a **Pull Request** with your changes

Check **CONTRIBUTING.md** for detailed guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
