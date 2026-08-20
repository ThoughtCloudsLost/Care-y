/**
* | output |
* | --- |
* | "Opened" |
*
* @param {Share_Status_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_status_opened: ((inputs?: Share_Status_OpenedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Status_OpenedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Status_OpenedInputs = {};
