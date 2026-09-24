/**
* | output |
* | --- |
* | "This uses your screen lock method. The same biometrics (fingerprint, face scan) or PIN you already use to unlock your phone or computer to verify it's really..." |
*
* @param {Twofa_Webauthn_Platform_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_platform_desc: ((inputs?: Twofa_Webauthn_Platform_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Webauthn_Platform_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Webauthn_Platform_DescInputs = {};
