/**
* | output |
* | --- |
* | "Try again" |
*
* @param {App_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const app_retry: ((inputs?: App_RetryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<App_RetryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type App_RetryInputs = {};
