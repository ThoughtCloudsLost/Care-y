/**
* | output |
* | --- |
* | "View Security Status" |
*
* @param {Vol_Link_Security_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_link_security_status: ((inputs?: Vol_Link_Security_StatusInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Link_Security_StatusInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Link_Security_StatusInputs = {};
