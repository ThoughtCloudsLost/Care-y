/**
* | output |
* | --- |
* | "Messaging is currently unavailable for this support line." |
*
* @param {Portal_Messaging_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_messaging_disabled: ((inputs?: Portal_Messaging_DisabledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Messaging_DisabledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Messaging_DisabledInputs = {};
