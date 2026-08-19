/**
* | output |
* | --- |
* | "Drag the simulator by the grip above it and resize it from any edge, and use the toolbar to switch between phone and desktop layouts. The simulator and the h..." |
*
* @param {Demo_Entry_Controls_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_controls_body: ((inputs?: Demo_Entry_Controls_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Controls_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Controls_BodyInputs = {};
