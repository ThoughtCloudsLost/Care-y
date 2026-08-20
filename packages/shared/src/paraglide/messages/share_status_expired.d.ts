/**
* | output |
* | --- |
* | "Expired" |
*
* @param {Share_Status_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_status_expired: ((inputs?: Share_Status_ExpiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Status_ExpiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Status_ExpiredInputs = {};
