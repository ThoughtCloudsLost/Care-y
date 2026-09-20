/**
* | output |
* | --- |
* | "This message is too long." |
*
* @param {Portal_Composer_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_composer_too_long: ((inputs?: Portal_Composer_Too_LongInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Composer_Too_LongInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Composer_Too_LongInputs = {};
