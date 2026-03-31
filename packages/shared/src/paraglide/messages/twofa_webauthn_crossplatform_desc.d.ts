/**
* | output |
* | --- |
* | "This uses a small physical gadget (often a USB stick, a key fob, or a tap card) to verify it's really you. When you log in, you plug it into your computer or..." |
*
* @param {Twofa_Webauthn_Crossplatform_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_crossplatform_desc: ((inputs?: Twofa_Webauthn_Crossplatform_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Webauthn_Crossplatform_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Webauthn_Crossplatform_DescInputs = {};
