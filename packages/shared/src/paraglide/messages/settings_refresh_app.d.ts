/**
* | output |
* | --- |
* | "Refresh app" |
*
* @param {Settings_Refresh_AppInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_refresh_app: ((inputs?: Settings_Refresh_AppInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Refresh_AppInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Refresh_AppInputs = {};
