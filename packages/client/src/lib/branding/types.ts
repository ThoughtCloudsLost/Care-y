export interface BrandingData {
  orgName: string;
  primaryColor: string;
  accentColor: string | null;
  logoBlob: ArrayBuffer | null;
  clientText: string | null;
}

export interface CachedBranding {
  orgName: string;
  primaryColor: string;
  accentColor: string | null;
  logoBlobUrl: string | null;
  orgSlug: string | null;
  hasIcons: boolean;
}
