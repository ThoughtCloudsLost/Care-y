/**
* | output |
* | --- |
* | "Loading" |
*
* @param {Shell_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const shell_loading: ((inputs?: Shell_LoadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Shell_LoadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Shell_LoadingInputs = {};
