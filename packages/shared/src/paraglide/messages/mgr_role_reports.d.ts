/**
* | output |
* | --- |
* | "View reports and org metrics" |
*
* @param {Mgr_Role_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_role_reports: ((inputs?: Mgr_Role_ReportsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Role_ReportsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Role_ReportsInputs = {};
