/**
* | output |
* | --- |
* | "Drag the phone by the grip above it, resize it from any edge, or use the toolbar buttons to shrink it, restore it, or switch to a desktop shaped window. The ..." |
*
* @param {Demo_Entry_Phone_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_phone_body: ((inputs?: Demo_Entry_Phone_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Phone_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Phone_BodyInputs = {};
