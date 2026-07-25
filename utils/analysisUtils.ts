export interface CellAnalysis {
  id: string;
  col: string;
  row: number;
  score: number; // 0 - 100
  refDensity: number;
  artDensity: number;
  refEdgeCount: number;
  artEdgeCount: number;
  offsetX: number; // estimated horizontal deviation in px
  offsetY: number; // estimated vertical deviation in px
  issue: string;
  suggestion: string;
}

export interface ProportionAnalysisResult {
  overallScore: number;
  structuralAlignmentScore: number;
  lineFidelityScore: number;
  spatialProportionScore: number;
  valueGradientScore: number;
  gridSize: number;
  cellAnalyses: CellAnalysis[];
  heatmapDataUrl: string;
}

export interface ColorSwatch {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  artisticName: string;
  role: 'Dominant' | 'Secondary' | 'Accent' | 'Subdominant' | 'Background';
}

export interface ColorSymbolismResult {
  swatches: ColorSwatch[];
  temperature: { warmPercentage: number; coolPercentage: number; neutralPercentage: number; classification: string };
  valueStructure: { highKeyPercentage: number; midTonePercentage: number; lowKeyPercentage: number; contrastStyle: string };
  saturationProfile: { averageSaturation: number; classification: string };
  harmonyScheme: string;
  moodAnalysis: {
    headline: string;
    description: string;
    keywords: string[];
  };
  symbolismAnalysis: {
    essay: string;
    allegoricalThemes: string[];
    artisticTechniques: string[];
  };
}

// Classical fine art pigment / color mapping dictionary
const ART_PIGMENTS = [
  { name: 'Burnt Umber', r: 106, g: 54, b: 35 },
  { name: 'Raw Sienna', r: 199, g: 138, b: 67 },
  { name: 'Yellow Ochre', r: 203, g: 157, b: 67 },
  { name: 'Cadmium Crimson', r: 181, g: 23, b: 40 },
  { name: 'Naples Yellow', r: 247, g: 218, b: 120 },
  { name: 'Cerulean Blue', r: 42, g: 130, b: 186 },
  { name: 'Deep Ultramarine', r: 24, g: 43, b: 115 },
  { name: 'Viridian Green', r: 64, g: 130, b: 109 },
  { name: 'Tenebrous Charcoal', r: 35, g: 35, b: 38 },
  { name: 'Titanium White', r: 245, g: 245, b: 242 },
  { name: 'Ivory Black', r: 20, g: 20, b: 22 },
  { name: 'Phthalo Cyan', r: 0, g: 159, b: 183 },
  { name: 'Venetian Red', r: 168, g: 50, b: 45 },
  { name: 'Payne\'s Grey', r: 64, g: 78, b: 92 },
  { name: 'Alizarin Crimson', r: 140, g: 18, b: 43 },
  { name: 'Cobalt Blue', r: 0, g: 71, b: 171 },
  { name: 'Terre Verte', r: 85, g: 107, b: 47 },
  { name: 'Burnt Sienna', r: 233, g: 116, b: 81 },
  { name: 'Verditer Frost', r: 176, g: 224, b: 230 },
  { name: 'Sepia Noir', r: 70, g: 50, b: 40 }
];

export function findClosestArtPigment(r: number, g: number, b: number): string {
  let closestName = 'Custom Pigment';
  let minDistance = Infinity;

  for (const pigment of ART_PIGMENTS) {
    const dist = Math.sqrt(
      Math.pow(r - pigment.r, 2) +
      Math.pow(g - pigment.g, 2) +
      Math.pow(b - pigment.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestName = pigment.name;
    }
  }
  return closestName;
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Analyzes proportions between reference image and artwork image grid square by grid square.
 */
export async function compareGridProportions(
  refImgElement: HTMLImageElement,
  artImgElement: HTMLImageElement,
  gridSize: number = 8,
  transform: { scale: number; x: number; y: number; rotation: number; opacity: number } = { scale: 1, x: 0, y: 0, rotation: 0, opacity: 1 }
): Promise<ProportionAnalysisResult> {
  const width = 800;
  const height = 600;

  const refCanvas = document.createElement('canvas');
  refCanvas.width = width;
  refCanvas.height = height;
  const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });

  const artCanvas = document.createElement('canvas');
  artCanvas.width = width;
  artCanvas.height = height;
  const artCtx = artCanvas.getContext('2d', { willReadFrequently: true });

  const heatmapCanvas = document.createElement('canvas');
  heatmapCanvas.width = width;
  heatmapCanvas.height = height;
  const heatCtx = heatmapCanvas.getContext('2d');

  if (!refCtx || !artCtx || !heatCtx) {
    throw new Error('Canvas 2D context creation failed');
  }

  // Draw reference scaled to fit 800x600 centered
  const refAspect = refImgElement.width / refImgElement.height;
  const canvasAspect = width / height;
  let refDrawW = width;
  let refDrawH = height;
  let refDrawX = 0;
  let refDrawY = 0;

  if (refAspect > canvasAspect) {
    refDrawH = width / refAspect;
    refDrawY = (height - refDrawH) / 2;
  } else {
    refDrawW = height * refAspect;
    refDrawX = (width - refDrawW) / 2;
  }

  refCtx.fillStyle = '#FFFFFF';
  refCtx.fillRect(0, 0, width, height);
  refCtx.drawImage(refImgElement, refDrawX, refDrawY, refDrawW, refDrawH);

  // Draw artwork with user transform applied
  artCtx.fillStyle = '#FFFFFF';
  artCtx.fillRect(0, 0, width, height);
  artCtx.save();
  artCtx.translate(transform.x, transform.y);
  artCtx.rotate((transform.rotation * Math.PI) / 180);
  artCtx.scale(transform.scale, transform.scale);
  artCtx.globalAlpha = transform.opacity;

  const artScaleFit = Math.min(width / artImgElement.width, height / artImgElement.height);
  const artDrawW = artImgElement.width * artScaleFit;
  const artDrawH = artImgElement.height * artScaleFit;
  const artDrawX = (width - artDrawW) / 2;
  const artDrawY = (height - artDrawH) / 2;
  artCtx.drawImage(artImgElement, artDrawX, artDrawY, artDrawW, artDrawH);
  artCtx.restore();

  const refData = refCtx.getImageData(0, 0, width, height).data;
  const artData = artCtx.getImageData(0, 0, width, height).data;

  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  const cellAnalyses: CellAnalysis[] = [];

  let totalScoreSum = 0;
  let structuralAlignSum = 0;
  let lineFidelitySum = 0;
  let spatialPropSum = 0;
  let valueGradSum = 0;

  heatCtx.clearRect(0, 0, width, height);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const colChar = String.fromCharCode(65 + c);
      const rowNum = r + 1;
      const cellId = `${colChar}${rowNum}`;

      const startX = Math.floor(c * cellWidth);
      const startY = Math.floor(r * cellHeight);
      const endX = Math.floor((c + 1) * cellWidth);
      const endY = Math.floor((r + 1) * cellHeight);

      let refLuminanceSum = 0;
      let artLuminanceSum = 0;
      let refEdgeCount = 0;
      let artEdgeCount = 0;
      let pixelCount = 0;

      let refCenterXSum = 0;
      let refCenterYSum = 0;
      let artCenterXSum = 0;
      let artCenterYSum = 0;
      let refWeightSum = 0;
      let artWeightSum = 0;

      let squaredDiffSum = 0;

      for (let y = startY; y < endY; y += 2) {
        for (let x = startX; x < endX; x += 2) {
          const idx = (y * width + x) * 4;

          const refR = refData[idx];
          const refG = refData[idx + 1];
          const refB = refData[idx + 2];
          const refLum = 0.299 * refR + 0.587 * refG + 0.114 * refB;

          const artR = artData[idx];
          const artG = artData[idx + 1];
          const artB = artData[idx + 2];
          const artLum = 0.299 * artR + 0.587 * artG + 0.114 * artB;

          refLuminanceSum += refLum;
          artLuminanceSum += artLum;
          pixelCount++;

          const lumDiff = Math.abs(refLum - artLum);
          squaredDiffSum += lumDiff * lumDiff;

          const refInverted = 255 - refLum;
          const artInverted = 255 - artLum;

          if (refInverted > 80) {
            refEdgeCount++;
            refCenterXSum += x * refInverted;
            refCenterYSum += y * refInverted;
            refWeightSum += refInverted;
          }

          if (artInverted > 80) {
            artEdgeCount++;
            artCenterXSum += x * artInverted;
            artCenterYSum += y * artInverted;
            artWeightSum += artInverted;
          }
        }
      }

      const avgRefLum = refLuminanceSum / (pixelCount || 1);
      const avgArtLum = artLuminanceSum / (pixelCount || 1);

      let offsetX = 0;
      let offsetY = 0;
      if (refWeightSum > 0 && artWeightSum > 0) {
        const refComX = refCenterXSum / refWeightSum;
        const refComY = refCenterYSum / refWeightSum;
        const artComX = artCenterXSum / artWeightSum;
        const artComY = artCenterYSum / artWeightSum;
        offsetX = artComX - refComX;
        offsetY = artComY - refComY;
      }

      const mse = squaredDiffSum / (pixelCount || 1);
      const lumSimilarity = Math.max(0, 100 - (Math.abs(avgRefLum - avgArtLum) / 2.55));
      const edgeRatio = refEdgeCount > 0 ? Math.min(1, artEdgeCount / refEdgeCount) : (artEdgeCount === 0 ? 1 : 0.7);
      const edgeFidelity = edgeRatio * 100;
      const offsetDist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      const spatialAlignment = Math.max(0, 100 - offsetDist * 2.5);
      const valueGradient = Math.max(0, 100 - Math.sqrt(mse) * 0.8);

      const cellScore = Math.round(
        spatialAlignment * 0.35 +
        edgeFidelity * 0.25 +
        lumSimilarity * 0.20 +
        valueGradient * 0.20
      );

      totalScoreSum += cellScore;
      structuralAlignSum += spatialAlignment;
      lineFidelitySum += edgeFidelity;
      spatialPropSum += lumSimilarity;
      valueGradSum += valueGradient;

      let heatColor = 'rgba(34, 197, 94, 0.25)';
      if (cellScore < 60) {
        heatColor = 'rgba(239, 68, 68, 0.4)';
      } else if (cellScore < 80) {
        heatColor = 'rgba(245, 158, 11, 0.35)';
      }

      heatCtx.fillStyle = heatColor;
      heatCtx.fillRect(startX, startY, cellWidth, cellHeight);
      heatCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      heatCtx.lineWidth = 1;
      heatCtx.strokeRect(startX, startY, cellWidth, cellHeight);

      let issue = 'Proportions and line placement closely align with reference.';
      let suggestion = 'Maintain current value balance and subtle contours.';

      if (cellScore < 60) {
        if (Math.abs(offsetX) > Math.abs(offsetY)) {
          issue = offsetX > 0
            ? `Contour shifts ~${Math.abs(Math.round(offsetX))}px to the right compared to reference.`
            : `Contour shifts ~${Math.abs(Math.round(offsetX))}px to the left compared to reference.`;
          suggestion = offsetX > 0
            ? `Pull the key line left toward grid boundary ${colChar}.`
            : `Extend the outer line right toward grid boundary ${colChar}.`;
        } else if (Math.abs(offsetY) > 5) {
          issue = offsetY > 0
            ? `Feature is placed ~${Math.abs(Math.round(offsetY))}px too low.`
            : `Feature is placed ~${Math.abs(Math.round(offsetY))}px too high.`;
          suggestion = offsetY > 0
            ? `Elevate the apex of the curve upward within row ${rowNum}.`
            : `Lower the baseline downward toward grid row ${rowNum}.`;
        } else if (artEdgeCount < refEdgeCount * 0.5) {
          issue = 'Missing stroke detail and structural line weight.';
          suggestion = 'Define secondary outlines and subtle shadow passages.';
        } else {
          issue = 'Tonal value contrast deviates significantly from reference.';
          suggestion = 'Adjust dark accent values to mirror reference depth.';
        }
      } else if (cellScore < 80) {
        if (Math.abs(offsetX) > 3) {
          issue = `Slight horizontal drift of ~${Math.abs(Math.round(offsetX))}px.`;
          suggestion = `Nudge vertical guides closer to reference center.`;
        } else {
          issue = `Slight value imbalance between artwork and reference.`;
          suggestion = `Refine value transition across square ${cellId}.`;
        }
      }

      cellAnalyses.push({
        id: cellId,
        col: colChar,
        row: rowNum,
        score: cellScore,
        refDensity: Math.round(refEdgeCount / (pixelCount || 1) * 100),
        artDensity: Math.round(artEdgeCount / (pixelCount || 1) * 100),
        refEdgeCount,
        artEdgeCount,
        offsetX: Math.round(offsetX),
        offsetY: Math.round(offsetY),
        issue,
        suggestion,
      });
    }
  }

  const numCells = gridSize * gridSize;
  const overallScore = Math.min(99, Math.max(25, Math.round(totalScoreSum / numCells)));
  const structuralAlignmentScore = Math.min(99, Math.max(20, Math.round(structuralAlignSum / numCells)));
  const lineFidelityScore = Math.min(99, Math.max(20, Math.round(lineFidelitySum / numCells)));
  const spatialProportionScore = Math.min(99, Math.max(20, Math.round(spatialPropSum / numCells)));
  const valueGradientScore = Math.min(99, Math.max(20, Math.round(valueGradSum / numCells)));

  return {
    overallScore,
    structuralAlignmentScore,
    lineFidelityScore,
    spatialProportionScore,
    valueGradientScore,
    gridSize,
    cellAnalyses,
    heatmapDataUrl: heatmapCanvas.toDataURL(),
  };
}

/**
 * Extracts dominant palette, analyzes color harmony, temperature, value range,
 * and generates formal art critique with professional terminology on mood and symbolism.
 */
export async function extractColorAndSymbolism(
  artImgElement: HTMLImageElement
): Promise<ColorSymbolismResult> {
  const canvas = document.createElement('canvas');
  const width = 300;
  const height = Math.max(1, Math.round((300 * artImgElement.height) / artImgElement.width));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context failed');

  ctx.drawImage(artImgElement, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
  let totalSampled = 0;
  let warmCount = 0;
  let coolCount = 0;
  let neutralCount = 0;

  let highKeyCount = 0;
  let midToneCount = 0;
  let lowKeyCount = 0;
  let totalSatSum = 0;

  for (let i = 0; i < imgData.length; i += 16) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];
    if (a < 50) continue;

    totalSampled++;

    const hsl = rgbToHsl(r, g, b);
    totalSatSum += hsl.s;

    if (hsl.l > 70) highKeyCount++;
    else if (hsl.l < 30) lowKeyCount++;
    else midToneCount++;

    if (hsl.s < 12) {
      neutralCount++;
    } else if ((hsl.h >= 0 && hsl.h <= 70) || hsl.h >= 320) {
      warmCount++;
    } else if (hsl.h >= 140 && hsl.h <= 270) {
      coolCount++;
    } else {
      neutralCount++;
    }

    const qR = Math.floor(r / 32) * 32 + 16;
    const qG = Math.floor(g / 32) * 32 + 16;
    const qB = Math.floor(b / 32) * 32 + 16;
    const key = `${qR},${qG},${qB}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { r: qR, g: qG, b: qB, count: 0 };
    }
    colorBuckets[key].count++;
  }

  const sortedBuckets = Object.values(colorBuckets).sort((a, b) => b.count - a.count);

  const rawSwatches: ColorSwatch[] = [];
  const roles: ColorSwatch['role'][] = ['Dominant', 'Secondary', 'Subdominant', 'Accent', 'Background', 'Subdominant'];

  for (let idx = 0; idx < Math.min(6, sortedBuckets.length); idx++) {
    const bucket = sortedBuckets[idx];
    const percentage = Math.round((bucket.count / (totalSampled || 1)) * 100);
    const hsl = rgbToHsl(bucket.r, bucket.g, bucket.b);
    const hex = rgbToHex(bucket.r, bucket.g, bucket.b);
    const artisticName = findClosestArtPigment(bucket.r, bucket.g, bucket.b);

    rawSwatches.push({
      hex,
      rgb: { r: bucket.r, g: bucket.g, b: bucket.b },
      hsl,
      percentage: Math.max(1, percentage),
      artisticName,
      role: roles[idx] || 'Subdominant',
    });
  }

  const swatches = rawSwatches;

  const warmPct = Math.round((warmCount / (totalSampled || 1)) * 100);
  const coolPct = Math.round((coolCount / (totalSampled || 1)) * 100);
  const neutralPct = Math.round((neutralCount / (totalSampled || 1)) * 100);

  let tempClassification = 'Balanced Chromatic Temperature';
  if (warmPct > coolPct + 20) tempClassification = 'Warm Chromatic Palette (Solar / Earth Tones)';
  else if (coolPct > warmPct + 20) tempClassification = 'Cool Atmospheric Palette (Lunar / Nocturnal)';
  else if (neutralPct > 45) tempClassification = 'Tenebrous & Grayscale / Achromatic Bias';

  const highKeyPct = Math.round((highKeyCount / (totalSampled || 1)) * 100);
  const lowKeyPct = Math.round((lowKeyCount / (totalSampled || 1)) * 100);
  const midTonePct = Math.round((midToneCount / (totalSampled || 1)) * 100);

  let contrastStyle = 'Balanced Value Range';
  if (lowKeyPct > 45 && highKeyPct > 15) contrastStyle = 'High-Contrast Chiaroscuro / Tenebrism';
  else if (highKeyPct > 55) contrastStyle = 'High-Key Luminous Value Profile';
  else if (lowKeyPct > 55) contrastStyle = 'Low-Key Somber Value Profile';

  const avgSat = Math.round(totalSatSum / (totalSampled || 1));
  let satClassification = 'Moderate Chromatic Saturation';
  if (avgSat < 20) satClassification = 'Desaturated Earthy / Muted Tonalism';
  else if (avgSat > 55) satClassification = 'Vibrant High-Chromatic Expressionism';

  let harmonyScheme = 'Complex Analogous Palette';
  if (warmPct > 35 && coolPct > 35) harmonyScheme = 'Complementary Warm-Cool Juxtaposition';
  else if (avgSat < 15) harmonyScheme = 'Monochromatic Achromatic Harmony';
  else if (swatches.length >= 3 && Math.abs(swatches[0].hsl.h - swatches[1].hsl.h) > 110) harmonyScheme = 'Triadic Chromatic Harmony';

  const dominantSwatch = swatches[0] || { artisticName: 'Titanium White', hex: '#ffffff' };
  const accentSwatch = swatches.find(s => s.role === 'Accent') || swatches[1] || dominantSwatch;

  let moodHeadline = 'Evocative Atmosphere with Subtle Tonal Depth';
  let moodDescription = `The interplay of ${dominantSwatch.artisticName} alongside ${accentSwatch.artisticName} establishes a refined visual equilibrium. The ${tempClassification.toLowerCase()} generates an immersive spatial mood.`;
  let moodKeywords = ['Equilibrium', 'Tonal Depth', 'Atmospheric'];

  if (lowKeyPct > 40) {
    moodHeadline = 'Intense Dramatic Tension & Tenebrous Mood';
    moodDescription = `Dominated by deep passages of ${dominantSwatch.artisticName}, the composition employs dramatic chiaroscuro to evoke introspective mystery and weight. High tonal contrast sharpens the focal hierarchy.`;
    moodKeywords = ['Dramatic Chiaroscuro', 'Tenebrous', 'Introspective', 'Focal Weight'];
  } else if (warmPct > 50) {
    moodHeadline = 'Luminous Warmth & Vibrant Energy';
    moodDescription = `Radiant accents of ${dominantSwatch.artisticName} infuse the artwork with tactile vitality and emotional warmth. The chromatic temperature creates an inviting, expressive visual presence.`;
    moodKeywords = ['Solar Warmth', 'Vitality', 'Tactile Energy', 'Luminous'];
  } else if (coolPct > 50) {
    moodHeadline = 'Serene Ethereal Solitude & Atmospheric Calm';
    moodDescription = `The pervasive cooling presence of ${dominantSwatch.artisticName} creates a tranquil, introspective atmosphere. Atmospheric perspective is heightened through soft value gradations.`;
    moodKeywords = ['Ethereal', 'Atmospheric Perspective', 'Tranquil', 'Contemplative'];
  }

  const symbolismEssay = `In formal art analysis, the chromatic deployment in this artwork functions as both a structural device and a symbolic carrier. The dominant presence of ${dominantSwatch.artisticName} (${dominantSwatch.percentage}% surface area) anchors the pictorial plane, serving as the foundational groundwork for narrative interpretation. 

The color arrangement reflects a ${harmonyScheme.toLowerCase()}, where value relationships regulate visual rhythm and spatial depth. Notice how the juxtaposition between ${dominantSwatch.artisticName} and ${accentSwatch.artisticName} creates focal tension—a technique historically utilized to demarcate symbolic dualities such as light versus shadow, ephemeral versus enduring, or physical structure versus atmospheric void.

Furthermore, the ${contrastStyle.toLowerCase()} utilizes ${lowKeyPct}% low-key shadow masses against ${highKeyPct}% high-key luminous highlights. This high value gradient employs the traditional principles of *chiaroscuro* to emphasize volume, mass, and emotional gravity within the composition.`;

  const allegoricalThemes = [
    `Dualistic Tension: Juxtaposition between ${dominantSwatch.artisticName} and ${accentSwatch.artisticName} symbolizing opposing narrative forces.`,
    `Temporal Transience: Value gradations evoking light decay and atmospheric perspective.`,
    `Spatial Geometry: Chromatic saturation guiding focal emphasis and visual weight.`
  ];

  const artisticTechniques = [
    `Chiaroscuro & Tenebrism (${contrastStyle})`,
    `Chromatic Temperature Balance (${tempClassification})`,
    `Atmospheric Perspective via Saturation Modulation`,
    `Harmonic Palette Clustering (${harmonyScheme})`
  ];

  return {
    swatches,
    temperature: { warmPercentage: warmPct, coolPercentage: coolPct, neutralPercentage: neutralPct, classification: tempClassification },
    valueStructure: { highKeyPercentage: highKeyPct, midTonePercentage: midTonePct, lowKeyPercentage: lowKeyPct, contrastStyle },
    saturationProfile: { averageSaturation: avgSat, classification: satClassification },
    harmonyScheme,
    moodAnalysis: {
      headline: moodHeadline,
      description: moodDescription,
      keywords: moodKeywords,
    },
    symbolismAnalysis: {
      essay: symbolismEssay,
      allegoricalThemes,
      artisticTechniques,
    },
  };
}
