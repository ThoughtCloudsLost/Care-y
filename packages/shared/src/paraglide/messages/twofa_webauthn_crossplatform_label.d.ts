/**
* | output |
* | --- |
* | "Physical plug-in or tap verification" |
*
* @param {Twofa_Webauthn_Crossplatform_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_webauthn_crossplatform_label: ((inputs?: Twofa_Webauthn_Crossplatform_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Webauthn_Crossplatform_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Webauthn_Crossplatform_LabelInputs = {};
