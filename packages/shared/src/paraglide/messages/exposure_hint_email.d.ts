/**
* | output |
* | --- |
* | "Email is the easiest channel to fake. Anyone who controls the sender's mailbox, or pretends to, can send messages that look real. Verify anything important t..." |
*
* @param {Exposure_Hint_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_email: ((inputs?: Exposure_Hint_EmailInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_EmailInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_EmailInputs = {};
