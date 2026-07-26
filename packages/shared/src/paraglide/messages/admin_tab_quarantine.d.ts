/**
* | output |
* | --- |
* | "Quarantine" |
*
* @param {Admin_Tab_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_quarantine: ((inputs?: Admin_Tab_QuarantineInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_QuarantineInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_QuarantineInputs = {};
