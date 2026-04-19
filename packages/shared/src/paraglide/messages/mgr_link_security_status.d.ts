/**
* | output |
* | --- |
* | "View Security Status" |
*
* @param {Mgr_Link_Security_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_link_security_status: ((inputs?: Mgr_Link_Security_StatusInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Link_Security_StatusInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Link_Security_StatusInputs = {};
