export type PassphraseStrength = "too-short" | "acceptable" | "good" | "strong";

export function assessPassphraseStrength(
  passphrase: string,
  minLength = 20,
): PassphraseStrength {
  const len = passphrase.length;
  if (len < minLength) return "too-short";
  if (len < minLength + 10) return "acceptable";
  if (len < minLength + 20) return "good";
  return "strong";
}

export function looksLikeCommonPattern(passphrase: string): boolean {
  if (new Set(passphrase).size === 1) return true;
  if (/^[0-9]+$/.test(passphrase) && passphrase.length < 30) return true;
  return false;
}
