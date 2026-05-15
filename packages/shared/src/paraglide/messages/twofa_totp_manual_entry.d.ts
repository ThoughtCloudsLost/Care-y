/**
* | output |
* | --- |
* | "Or enter this code manually" |
*
* @param {Twofa_Totp_Manual_EntryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_manual_entry: ((inputs?: Twofa_Totp_Manual_EntryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Totp_Manual_EntryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Totp_Manual_EntryInputs = {};
