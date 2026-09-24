/**
* | output |
* | --- |
* | "Many people use this number, like a shelter or clinic phone. Shared numbers are not used to suggest duplicates." |
*
* @param {Phone_Shared_Line_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const phone_shared_line_hint: ((inputs?: Phone_Shared_Line_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Phone_Shared_Line_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Phone_Shared_Line_HintInputs = {};
