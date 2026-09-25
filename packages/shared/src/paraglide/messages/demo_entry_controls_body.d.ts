/**
* | output |
* | --- |
* | "When the app simulator is open, a toolbar above the simulator lets you enter fullscreen mode, resize to phone or desktop presets, and switch the logged in us..." |
*
* @param {Demo_Entry_Controls_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_controls_body: ((inputs?: Demo_Entry_Controls_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Controls_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Controls_BodyInputs = {};
