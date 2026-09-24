/**
* | output |
* | --- |
* | "CARE-Y app handbook" |
*
* @param {Demo_Phone_Frame_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_phone_frame_title: ((inputs?: Demo_Phone_Frame_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Phone_Frame_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Phone_Frame_TitleInputs = {};
