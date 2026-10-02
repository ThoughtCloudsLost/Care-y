/**
* | output |
* | --- |
* | "Switching view" |
*
* @param {Demo_Viewer_SwitchingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_viewer_switching: ((inputs?: Demo_Viewer_SwitchingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Viewer_SwitchingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Viewer_SwitchingInputs = {};
