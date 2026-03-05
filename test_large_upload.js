const fs = require('fs');
const crypto = require('crypto');

async function testUpload() {
    // Generate a 13.5MB dummy PDF (valid starting magic bytes)
    const header = Buffer.from('%PDF-1.4\n');
    const filler = crypto.randomBytes(13.5 * 1024 * 1024);
    const fakePdf = Buffer.concat([header, filler]);

    // Create form data using native fetch APIs
    const { FormData } = require('undici');

    const formData = new FormData();
    // Wrap in a Blob-like object so undici accepts it as a File
    const blob = new Blob([fakePdf], { type: 'application/pdf' });
    formData.append('file', blob, 'large_test_file.pdf');

    console.log("Starting upload of 13.5MB file...");
    try {
        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
            // don't send cookies, it will fail auth, but we should see IF it reaches our code and returns 401
            // If Next.js blocks it for size before auth, we will see 413 Payload Too Large!
        });

        const text = await res.text();
        console.log(`Response Status: ${res.status}`);
        console.log(`Response Body: ${text.slice(0, 200)}`);
    } catch (err) {
        console.error("Fetch failed completely (socket hang up maybe?):", err.message);
    }
}

testUpload();
