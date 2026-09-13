/**
* | output |
* | --- |
* | "Where the quick-exit button sends portal visitors. Leave blank for a default weather page." |
*
* @param {Admin_Org_General_Safe_Exit_Url_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_safe_exit_url_hint: ((inputs?: Admin_Org_General_Safe_Exit_Url_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Org_General_Safe_Exit_Url_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Org_General_Safe_Exit_Url_HintInputs = {};
