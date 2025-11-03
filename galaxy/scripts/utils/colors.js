// Color palette and utilities for Neurelix branding

export const colors = {
    // Primary colors
    neonBlue: 0x00d4ff,
    neonOrange: 0xff6b35,
    
    // Background
    darkSpace: 0x0a0e27,
    deepSpace: 0x050812,
    
    // Accents
    purple: 0x9d4edd,
    cyan: 0x06ffa5,
    pink: 0xff006e,
    
    // Neutral
    white: 0xffffff,
    lightGray: 0xe0e6ed,
    gray: 0xa0aec0,
    darkGray: 0x4a5568,
    
    // Category colors
    frontend: 0x00d4ff,    // Blue
    backend: 0xff6b35,     // Orange
    mobile: 0x9d4edd,      // Purple
    devops: 0x06ffa5,      // Cyan
    ai: 0xff006e,          // Pink
    database: 0xffd60a     // Yellow
};

export const emissiveColors = {
    neonBlue: { color: colors.neonBlue, intensity: 0.5 },
    neonOrange: { color: colors.neonOrange, intensity: 0.5 },
    purple: { color: colors.purple, intensity: 0.4 },
    cyan: { color: colors.cyan, intensity: 0.4 },
    pink: { color: colors.pink, intensity: 0.4 }
};

export function getCategoryColor(category) {
    const categoryMap = {
        'frontend': colors.frontend,
        'backend': colors.backend,
        'mobile': colors.mobile,
        'devops': colors.devops,
        'ai': colors.ai,
        'database': colors.database,
        'web': colors.frontend
    };
    
    return categoryMap[category] || colors.neonBlue;
}

export function hexToRgb(hex) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
}

export function rgbToHex(r, g, b) {
    return (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255);
}

export function lerpColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    return rgbToHex(
        c1.r + (c2.r - c1.r) * t,
        c1.g + (c2.g - c1.g) * t,
        c1.b + (c2.b - c1.b) * t
    );
}
