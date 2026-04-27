export type PassphraseStrength = "too-short" | "acceptable" | "good" | "strong";

export function assessPassphraseStrength(
  passphrase: string,
): PassphraseStrength {
  const len = passphrase.length;
  if (len < 20) return "too-short";
  if (len < 30) return "acceptable";
  if (len < 40) return "good";
  return "strong";
}

export function looksLikeCommonPattern(passphrase: string): boolean {
  if (new Set(passphrase).size === 1) return true;
  if (/^[0-9]+$/.test(passphrase) && passphrase.length < 30) return true;
  return false;
}
