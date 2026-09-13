/**
* | output |
* | --- |
* | "View reports" |
*
* @param {Permission_View_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_reports: ((inputs?: Permission_View_ReportsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_ReportsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_ReportsInputs = {};
