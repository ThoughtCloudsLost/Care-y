/**
* | output |
* | --- |
* | "Go to home" |
*
* @param {Common_Go_HomeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const common_go_home: ((inputs?: Common_Go_HomeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Common_Go_HomeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Common_Go_HomeInputs = {};
