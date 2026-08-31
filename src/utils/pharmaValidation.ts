/**
 * Security, sanitization, and mathematical boundary validation
 * for PharmaYemen - Health Facilities Platform.
 */

// Strip HTML tags, script blocks, and dangerous execution patterns
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip entire script block
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Strip entire style block
    .replace(/<[^>]*>?/gm, '') // Strip remaining HTML tags
    .replace(/javascript\s*:/gi, '') // Strip javascript: protocol
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '') // Strip inline event handlers like onerror="..."
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    .trim();
}

// Validate and sanitize numeric quantity
export function validateQuantity(value: number | string): { valid: boolean; value: number; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, value: 0, error: 'الكمية يجب أن تكون رقماً صالحاً' };
  }
  if (num <= 0) {
    return { valid: false, value: 0, error: 'الكمية يجب أن تكون أكبر من الصفر' };
  }
  if (num > 1000000) {
    return { valid: false, value: 1000000, error: 'الكمية تجاوزت الحد الأقصى المسموح (1,000,000)' };
  }
  return { valid: true, value: Math.floor(num) };
}

// Validate price
export function validatePrice(value: number | string | undefined): { valid: boolean; value: number; error?: string } {
  if (value === undefined || value === null || value === '') {
    return { valid: true, value: 0 };
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, value: 0, error: 'السعر يجب أن يكون رقماً صالحاً' };
  }
  if (num < 0) {
    return { valid: false, value: 0, error: 'السعر لا يمكن أن يكون سالباً' };
  }
  if (num > 100000000) {
    return { valid: false, value: 100000000, error: 'السعر تجاوز الحد الأقصى المسموح' };
  }
  return { valid: true, value: num };
}

// Validate Expiry Date (YYYY-MM-DD)
export function validateExpiryDate(dateStr: string): { valid: boolean; error?: string } {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'تاريخ الصلاحية مطلوب' };
  }
  
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'صيغة تاريخ الصلاحية غير صحيحة' };
  }

  // Ensure year is realistic (between 2024 and 2040)
  const year = parsed.getFullYear();
  if (year < 2024) {
    return { valid: false, error: 'تاريخ الصلاحية منتهي الصلاحية أو قديم جداً (أقل من 2024)' };
  }
  if (year > 2045) {
    return { valid: false, error: 'تاريخ الصلاحية غير واقعي (يتجاوز 2045)' };
  }

  return { valid: true };
}

// Safe Renal Clearance (Cockcroft-Gault) without NaN or Division by Zero
export function safeCockcroftGault(
  age: number,
  weightKg: number,
  serumCrMgDl: number,
  isFemale: boolean
): { crCl: number; isValid: boolean; warning?: string } {
  if (age <= 0 || isNaN(age) || age > 125) {
    return { crCl: 0, isValid: false, warning: 'العمر يجب أن يكون بين 1 و 125 عاماً' };
  }
  if (weightKg <= 0 || isNaN(weightKg) || weightKg > 400) {
    return { crCl: 0, isValid: false, warning: 'الوزن يجب أن يكون بين 1 و 400 كجم' };
  }
  if (serumCrMgDl <= 0 || isNaN(serumCrMgDl) || serumCrMgDl > 30) {
    return { crCl: 0, isValid: false, warning: 'مستوى الكرياتينين غير صالح (أكبر من 0)' };
  }

  // Formula: ((140 - Age) * Weight) / (72 * SerumCr) * (0.85 if female)
  const numerator = (140 - age) * weightKg;
  const denominator = 72 * serumCrMgDl;
  let result = (numerator / denominator);
  if (isFemale) {
    result *= 0.85;
  }

  return { crCl: Math.max(0, Math.round(result * 10) / 10), isValid: true };
}
