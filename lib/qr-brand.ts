/*
 * ============================================================
 * QR BRAND MARK
 * ============================================================
 *
 * Bakes the TapQR brand mark into generated QR codes:
 *
 *  - Center mark (default ON): a white badge with the TapQR
 *    logo in the QR center, kept under ~20% of the QR area so
 *    scanning never breaks (QRs are generated with error
 *    correction level H).
 *  - Business logo alongside: when the business has a logo,
 *    it takes the center badge and the TapQR mark shrinks to
 *    a small badge overlapping the badge's bottom edge.
 *  - "Powered by TapQR" frame (optional): a caption bar
 *    under the QR.
 */

export type BrandMarkOptions = {
  /** TapQR logo URL. Defaults to "/logo.png". */
  tapqrLogoUrl?: string;
  /** Business logo URL (optional). */
  businessLogoUrl?: string | null;
  /** Add the "Powered by TapQR" caption bar. */
  poweredByFrame?: boolean;
};

const DEFAULT_LOGO = "/logo.png";

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Allow cross-origin business logos.
    img.crossOrigin = "anonymous";
    img.onload = () =>
      resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          `Could not load image: ${src}`
        )
      );
    img.src = src;
  });
}

async function loadImageDataUrl(
  src: string
): Promise<string | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;

    const blob =
      await response.blob();

    return await new Promise<
      string | null
    >((resolve) => {
      const reader =
        new FileReader();
      reader.onload = () =>
        resolve(
          typeof reader.result ===
            "string"
            ? reader.result
            : null
        );
      reader.onerror = () =>
        resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + h,
    r
  );
  ctx.arcTo(
    x + w,
    y + h,
    x,
    y + h,
    r
  );
  ctx.arcTo(
    x,
    y + h,
    x,
    y,
    r
  );
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draw an image "contained" inside a box, preserving aspect.
 */
function drawContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.min(
    w / img.naturalWidth,
    h / img.naturalHeight
  );

  const dw =
    img.naturalWidth * scale;
  const dh =
    img.naturalHeight * scale;

  ctx.drawImage(
    img,
    x + (w - dw) / 2,
    y + (h - dh) / 2,
    dw,
    dh
  );
}

/**
 * Composite the TapQR brand mark onto a QR PNG data URL.
 * Returns a new PNG data URL.
 */
export async function applyBrandMarkToPng(
  qrDataUrl: string,
  options: BrandMarkOptions = {}
): Promise<string> {
  const {
    tapqrLogoUrl = DEFAULT_LOGO,
    businessLogoUrl = null,
    poweredByFrame = false,
  } = options;

  const qr = await loadImage(qrDataUrl);

  const size = qr.naturalWidth;
  const frameH = poweredByFrame
    ? Math.round(size * 0.14)
    : 0;

  const canvas =
    document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + frameH;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Canvas is not available."
    );
  }

  // QR
  ctx.drawImage(qr, 0, 0, size, size);

  // --- Center badge (<=20% of QR area) ---
  const badgeSize = Math.round(
    size * 0.2
  );
  const bx = (size - badgeSize) / 2;
  const by = (size - badgeSize) / 2;

  ctx.save();
  ctx.shadowColor =
    "rgba(15, 23, 42, 0.18)";
  ctx.shadowBlur = Math.round(
    size * 0.02
  );
  ctx.shadowOffsetY = Math.round(
    size * 0.005
  );
  ctx.fillStyle = "#ffffff";
  roundRect(
    ctx,
    bx,
    by,
    badgeSize,
    badgeSize,
    Math.round(badgeSize * 0.22)
  );
  ctx.fill();
  ctx.restore();

  const pad = Math.round(
    badgeSize * 0.18
  );

  // Business logo takes the center when present;
  // the TapQR mark shrinks to a small overlapping badge.
  let businessDrawn = false;

  if (businessLogoUrl) {
    try {
      const logo = await loadImage(
        businessLogoUrl
      );
      drawContained(
        ctx,
        logo,
        bx + pad,
        by + pad,
        badgeSize - pad * 2,
        badgeSize - pad * 2
      );
      businessDrawn = true;
    } catch {
      businessDrawn = false;
    }
  }

  if (!businessDrawn) {
    try {
      const tapqr = await loadImage(
        tapqrLogoUrl
      );
      drawContained(
        ctx,
        tapqr,
        bx + pad,
        by + pad,
        badgeSize - pad * 2,
        badgeSize - pad * 2
      );
    } catch {
      // Logo missing — QR still works, just unbranded.
    }
  } else {
    // Small TapQR badge overlapping the center
    // badge's bottom edge.
    try {
      const tapqr = await loadImage(
        tapqrLogoUrl
      );

      const mini = Math.round(
        size * 0.075
      );
      const mx = (size - mini) / 2;
      const my =
        by + badgeSize - mini / 2;

      ctx.save();
      ctx.shadowColor =
        "rgba(15, 23, 42, 0.2)";
      ctx.shadowBlur = Math.round(
        size * 0.012
      );
      ctx.fillStyle = "#ffffff";
      roundRect(
        ctx,
        mx,
        my,
        mini,
        mini,
        Math.round(mini * 0.28)
      );
      ctx.fill();
      ctx.restore();

      const mpad = Math.round(
        mini * 0.2
      );
      drawContained(
        ctx,
        tapqr,
        mx + mpad,
        my + mpad,
        mini - mpad * 2,
        mini - mpad * 2
      );
    } catch {
      /* optional */
    }
  }

  // --- "Powered by TapQR" frame ---
  if (poweredByFrame) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(
      0,
      size,
      size,
      frameH
    );

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.round(
      frameH * 0.38
    )}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(
      "Powered by TapQR · tapqr.shop",
      size / 2,
      size + frameH / 2
    );
  }

  return canvas.toDataURL(
    "image/png"
  );
}

/**
 * Inject the brand mark into an SVG QR string.
 * The logo is embedded as a data URL so the SVG stays
 * self-contained.
 */
export async function applyBrandMarkToSvg(
  svg: string,
  options: BrandMarkOptions = {}
): Promise<string> {
  const {
    tapqrLogoUrl = DEFAULT_LOGO,
    businessLogoUrl = null,
    poweredByFrame = false,
  } = options;

  const widthMatch = svg.match(
    /width="(\d+)"/
  );
  const heightMatch = svg.match(
    /height="(\d+)"/
  );

  const size = widthMatch
    ? parseInt(widthMatch[1], 10)
    : 1600;
  const height = heightMatch
    ? parseInt(heightMatch[1], 10)
    : size;

  const frameH = poweredByFrame
    ? Math.round(size * 0.14)
    : 0;

  // Center badge (<=20% of QR area)
  const badgeSize = Math.round(
    size * 0.2
  );
  const bx = (size - badgeSize) / 2;
  const by = (height - badgeSize) / 2;
  const br = Math.round(
    badgeSize * 0.22
  );
  const pad = Math.round(
    badgeSize * 0.18
  );
  const inner = badgeSize - pad * 2;

  let centerImage: string | null =
    null;

  if (businessLogoUrl) {
    centerImage =
      await loadImageDataUrl(
        businessLogoUrl
      );
  }

  if (!centerImage) {
    centerImage =
      await loadImageDataUrl(
        tapqrLogoUrl
      );
  }

  let overlay = `<rect x="${bx}" y="${by}" width="${badgeSize}" height="${badgeSize}" rx="${br}" fill="#ffffff"/>`;

  if (centerImage) {
    overlay += `<image href="${centerImage}" x="${
      bx + pad
    }" y="${by + pad}" width="${inner}" height="${inner}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  let frame = "";

  if (poweredByFrame) {
    const fontSize = Math.round(
      frameH * 0.38
    );
    frame =
      `<rect x="0" y="${height}" width="${size}" height="${frameH}" fill="#0f172a"/>` +
      `<text x="${size / 2}" y="${
        height + frameH / 2
      }" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="700" font-size="${fontSize}" fill="#ffffff">Powered by TapQR · tapqr.shop</text>`;
  }

  return svg
    .replace(
      /<svg([^>]*)>/,
      `<svg$1 height="${
        height + frameH
      }" viewBox="0 0 ${size} ${
        height + frameH
      }">`
    )
    .replace(
      "</svg>",
      `${overlay}${frame}</svg>`
    );
}
