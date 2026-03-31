/**
* | output |
* | --- |
* | "CARE-Y" |
*
* @param {App_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const app_name: ((inputs?: App_NameInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<App_NameInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type App_NameInputs = {};
