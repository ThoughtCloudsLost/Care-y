/**
* | output |
* | --- |
* | "You are offline. Some features are unavailable." |
*
* @param {App_OfflineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const app_offline: ((inputs?: App_OfflineInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<App_OfflineInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type App_OfflineInputs = {};
