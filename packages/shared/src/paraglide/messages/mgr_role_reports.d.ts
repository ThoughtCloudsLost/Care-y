/**
* | output |
* | --- |
* | "View reports and org metrics" |
*
* @param {Mgr_Role_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_role_reports: ((inputs?: Mgr_Role_ReportsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Role_ReportsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Role_ReportsInputs = {};
