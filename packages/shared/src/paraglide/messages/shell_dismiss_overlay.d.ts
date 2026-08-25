/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Shell_Dismiss_OverlayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const shell_dismiss_overlay: ((inputs?: Shell_Dismiss_OverlayInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Shell_Dismiss_OverlayInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Shell_Dismiss_OverlayInputs = {};
