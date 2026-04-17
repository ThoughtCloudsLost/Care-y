/**
* | output |
* | --- |
* | "Log out" |
*
* @param {Panel_LogoutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_logout: ((inputs?: Panel_LogoutInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_LogoutInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_LogoutInputs = {};
