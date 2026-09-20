/**
* | output |
* | --- |
* | "No messages yet. Your conversation will appear here." |
*
* @param {Portal_Empty_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_empty_thread: ((inputs?: Portal_Empty_ThreadInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Empty_ThreadInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Empty_ThreadInputs = {};
