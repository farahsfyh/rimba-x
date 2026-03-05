const pdf = require('pdf-parse');
async function run() {
    try {
        const buffer = Buffer.from('JVBERi0xLgoxIDAgb2JqPDwvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqPDwvS2lkc1swIDAgUl0+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+Cg==', 'base64');
        const parser = new pdf.PDFParse({ data: buffer });
        console.log("PDFParse:", Object.keys(parser));
    } catch (err) {
        console.error("Error:", err);
    }
}
run();
