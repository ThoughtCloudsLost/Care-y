/**
* | output |
* | --- |
* | "Make sure no screen sharing or recording is active" |
*
* @param {Admin_Escrow_Browser_Safety_ScreenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_screen: ((inputs?: Admin_Escrow_Browser_Safety_ScreenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Browser_Safety_ScreenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Browser_Safety_ScreenInputs = {};
