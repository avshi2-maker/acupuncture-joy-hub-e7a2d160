/**
 * Validates an Israeli ID number (Teudat Zehut) using the Luhn algorithm variant.
 * 
 * The Israeli ID is 9 digits. The algorithm:
 * 1. Pad to 9 digits with leading zeros if needed
 * 2. Multiply each digit by 1 or 2 alternately (starting with 1)
 * 3. If result > 9, sum the digits (e.g., 12 -> 1+2 = 3)
 * 4. Sum all results
 * 5. Valid if sum is divisible by 10
 */
export function validateIsraeliId(id: string): { valid: boolean; error?: string } {
  // Remove any non-digit characters
  const cleanId = id.replace(/\D/g, '');
  
  // Check length (must be 5-9 digits, we pad to 9)
  if (cleanId.length < 5 || cleanId.length > 9) {
    return { valid: false, error: 'ID must be 5-9 digits' };
  }
  
  // Pad with leading zeros to 9 digits
  const paddedId = cleanId.padStart(9, '0');
  
  // Calculate checksum using Luhn variant
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(paddedId[i], 10);
    const multiplier = (i % 2) + 1; // Alternates 1, 2, 1, 2...
    let result = digit * multiplier;
    
    // If result > 9, sum its digits (equivalent to result - 9 for single doubling)
    if (result > 9) {
      result = Math.floor(result / 10) + (result % 10);
    }
    
    sum += result;
  }
  
  const isValid = sum % 10 === 0;
  
  return {
    valid: isValid,
    error: isValid ? undefined : 'Invalid ID checksum (ספרת ביקורת שגויה)',
  };
}

/**
 * Checks if the ID looks like an Israeli ID (purely numeric, 5-9 digits)
 * This is useful for determining whether to apply checksum validation
 */
export function looksLikeIsraeliId(id: string): boolean {
  const cleanId = id.replace(/\D/g, '');
  return cleanId.length >= 5 && cleanId.length <= 9 && /^\d+$/.test(cleanId);
}
