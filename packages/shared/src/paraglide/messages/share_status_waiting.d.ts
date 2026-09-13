/**
* | output |
* | --- |
* | "Waiting" |
*
* @param {Share_Status_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_status_waiting: ((inputs?: Share_Status_WaitingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Share_Status_WaitingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Share_Status_WaitingInputs = {};
