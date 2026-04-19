/**
* | output |
* | --- |
* | "You are not assigned to any queues yet." |
*
* @param {Vol_Queues_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_queues_empty: ((inputs?: Vol_Queues_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Queues_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Queues_EmptyInputs = {};
