/**
* | output |
* | --- |
* | "Exit full screen" |
*
* @param {Demo_Fs_ExitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_exit: ((inputs?: Demo_Fs_ExitInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Fs_ExitInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Fs_ExitInputs = {};
