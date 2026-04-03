/**
* | output |
* | --- |
* | "Mention" |
*
* @param {Dashboard_Activity_MentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_mention: ((inputs?: Dashboard_Activity_MentionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_MentionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_MentionInputs = {};
