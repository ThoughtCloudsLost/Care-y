/**
* | output |
* | --- |
* | "The floating toolbar above the simulator is also a drag handle, so you can grab it anywhere to reposition the frame. Phone and desktop preset buttons in the ..." |
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
