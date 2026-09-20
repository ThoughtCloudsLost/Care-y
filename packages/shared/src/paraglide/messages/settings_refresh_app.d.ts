/**
* | output |
* | --- |
* | "Refresh app" |
*
* @param {Settings_Refresh_AppInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_refresh_app: ((inputs?: Settings_Refresh_AppInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Refresh_AppInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Refresh_AppInputs = {};
