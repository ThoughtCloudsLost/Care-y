/**
* | output |
* | --- |
* | "Volunteer email addresses (opt-in only)" |
*
* @param {Onboarding_Briefing_Practice_Email_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_email_data: ((inputs?: Onboarding_Briefing_Practice_Email_DataInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Practice_Email_DataInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Practice_Email_DataInputs = {};
