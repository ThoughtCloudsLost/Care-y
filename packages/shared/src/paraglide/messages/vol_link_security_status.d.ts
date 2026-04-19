/**
* | output |
* | --- |
* | "View Security Status" |
*
* @param {Vol_Link_Security_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_link_security_status: ((inputs?: Vol_Link_Security_StatusInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Link_Security_StatusInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Link_Security_StatusInputs = {};
