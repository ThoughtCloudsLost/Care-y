/**
* | output |
* | --- |
* | "Make your messages more secure" |
*
* @param {Portal_Upgrade_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_title: ((inputs?: Portal_Upgrade_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Upgrade_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Upgrade_TitleInputs = {};
