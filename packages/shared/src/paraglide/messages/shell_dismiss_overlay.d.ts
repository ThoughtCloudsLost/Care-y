/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Shell_Dismiss_OverlayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const shell_dismiss_overlay: ((inputs?: Shell_Dismiss_OverlayInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Shell_Dismiss_OverlayInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Shell_Dismiss_OverlayInputs = {};
