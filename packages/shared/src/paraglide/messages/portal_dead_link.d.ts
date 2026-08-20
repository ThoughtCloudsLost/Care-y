/**
* | output |
* | --- |
* | "This link is no longer active. If you need help, contact your support team for a new one." |
*
* @param {Portal_Dead_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_dead_link: ((inputs?: Portal_Dead_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Dead_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Dead_LinkInputs = {};
