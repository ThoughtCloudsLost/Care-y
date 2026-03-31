const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(color: string): boolean {
  return HEX_REGEX.test(color);
}
