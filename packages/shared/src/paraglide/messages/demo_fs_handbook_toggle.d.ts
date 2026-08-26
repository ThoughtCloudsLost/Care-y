/**
* | output |
* | --- |
* | "Handbook" |
*
* @param {Demo_Fs_Handbook_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_handbook_toggle: ((inputs?: Demo_Fs_Handbook_ToggleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Fs_Handbook_ToggleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Fs_Handbook_ToggleInputs = {};
