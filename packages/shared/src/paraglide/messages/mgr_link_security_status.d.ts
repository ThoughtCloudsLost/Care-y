/**
* | output |
* | --- |
* | "View Security Status" |
*
* @param {Mgr_Link_Security_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_link_security_status: ((inputs?: Mgr_Link_Security_StatusInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Link_Security_StatusInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Link_Security_StatusInputs = {};
