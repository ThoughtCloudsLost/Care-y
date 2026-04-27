/**
* | output |
* | --- |
* | "View Reports" |
*
* @param {Mgr_Link_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_link_reports: ((inputs?: Mgr_Link_ReportsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Link_ReportsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Link_ReportsInputs = {};
