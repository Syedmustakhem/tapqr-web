const sharp = require("sharp");

async function optimize() {
  await sharp("public/icon.png")
    .resize(128, 128, {
      fit: "cover",
      position: "center",
    })
    .webp({
      quality: 85,
    })
    .toFile("public/tapqr-icon.webp");

  console.log("✅ TapQR icon optimized successfully!");
}

optimize().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});