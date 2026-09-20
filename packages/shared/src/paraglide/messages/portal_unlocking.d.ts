/**
* | output |
* | --- |
* | "Unlocking your messages..." |
*
* @param {Portal_UnlockingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_unlocking: ((inputs?: Portal_UnlockingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_UnlockingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_UnlockingInputs = {};
