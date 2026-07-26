/**
* | output |
* | --- |
* | "Merge history" |
*
* @param {Client_Merge_History_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_history_heading: ((inputs?: Client_Merge_History_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Merge_History_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Merge_History_HeadingInputs = {};
