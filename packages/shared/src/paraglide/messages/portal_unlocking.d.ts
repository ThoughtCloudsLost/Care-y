/**
* | output |
* | --- |
* | "Unlocking your messages..." |
*
* @param {Portal_UnlockingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_unlocking: ((inputs?: Portal_UnlockingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_UnlockingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_UnlockingInputs = {};
