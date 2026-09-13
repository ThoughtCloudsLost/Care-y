/**
* | output |
* | --- |
* | "No messages yet. Your conversation will appear here." |
*
* @param {Portal_Empty_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_empty_thread: ((inputs?: Portal_Empty_ThreadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Empty_ThreadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Empty_ThreadInputs = {};
