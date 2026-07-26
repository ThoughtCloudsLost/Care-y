/**
* | output |
* | --- |
* | "CARE-Y app demo" |
*
* @param {Demo_Phone_Frame_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_phone_frame_title: ((inputs?: Demo_Phone_Frame_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Phone_Frame_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Phone_Frame_TitleInputs = {};
