/**
* | output |
* | --- |
* | "Review security briefing" |
*
* @param {Settings_Review_BriefingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_review_briefing: ((inputs?: Settings_Review_BriefingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Review_BriefingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Review_BriefingInputs = {};
