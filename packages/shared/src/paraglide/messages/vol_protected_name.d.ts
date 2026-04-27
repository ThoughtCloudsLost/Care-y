/**
* | output |
* | --- |
* | "Your real name is end-to-end encrypted. Only your team can read it." |
*
* @param {Vol_Protected_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_protected_name: ((inputs?: Vol_Protected_NameInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Protected_NameInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Protected_NameInputs = {};
