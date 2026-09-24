/**
* | output |
* | --- |
* | "Screen lock verification" |
*
* @param {Twofa_Webauthn_Platform_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_platform_label: ((inputs?: Twofa_Webauthn_Platform_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Webauthn_Platform_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Webauthn_Platform_LabelInputs = {};
