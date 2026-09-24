/**
* | output |
* | --- |
* | "Or enter this code manually" |
*
* @param {Twofa_Totp_Manual_EntryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_manual_entry: ((inputs?: Twofa_Totp_Manual_EntryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Totp_Manual_EntryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Totp_Manual_EntryInputs = {};
