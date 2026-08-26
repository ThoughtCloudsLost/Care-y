/**
* | output |
* | --- |
* | "Open handbook" |
*
* @param {Demo_Fs_Drawer_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_drawer_open: ((inputs?: Demo_Fs_Drawer_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Fs_Drawer_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Fs_Drawer_OpenInputs = {};
