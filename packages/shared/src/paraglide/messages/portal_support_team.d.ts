/**
* | output |
* | --- |
* | "Support team" |
*
* @param {Portal_Support_TeamInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_support_team: ((inputs?: Portal_Support_TeamInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Support_TeamInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Support_TeamInputs = {};
