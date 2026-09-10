const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function processLogo() {
    const srcPath = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\2bfff329-d844-446d-961d-dc0723ef5653\\.user_uploaded\\media_1788102686742.jpg";
    const destPathCircle = path.join(__dirname, "pustaka_cilik_logo_circle.png");
    const destPathTransparent = path.join(__dirname, "pustaka_cilik_logo_transparent.png");

    console.log("Reading image from:", srcPath);
    const image1 = await Jimp.read(srcPath);
    const width = image1.bitmap.width;
    const height = image1.bitmap.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = (width / 2) * 0.96; // 96% radius to cut outer square white corners

    // 1. CIRCLE CUTOUT PNG (Keeps the full circular emblem intact, removes outside square white background)
    image1.scan(0, 0, width, height, function (x, y, idx) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) {
            this.bitmap.data[idx + 3] = 0; // Alpha = 0 outside circle
        }
    });
    await image1.write(destPathCircle);
    console.log("Saved circular emblem PNG to:", destPathCircle);

    // 2. TRANSPARENT BACKGROUND PNG (Removes both outer white corners AND inner white background)
    const image2 = await Jimp.read(srcPath);
    image2.scan(0, 0, width, height, function (x, y, idx) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) {
            this.bitmap.data[idx + 3] = 0;
        } else {
            const r = this.bitmap.data[idx];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            // If pixel is pure or near white inside the ring
            if (r > 240 && g > 240 && b > 240) {
                this.bitmap.data[idx + 3] = 0;
            }
        }
    });
    await image2.write(destPathTransparent);
    console.log("Saved transparent background PNG to:", destPathTransparent);
}

processLogo().catch(err => {
    console.error("Error processing logo:", err);
});
