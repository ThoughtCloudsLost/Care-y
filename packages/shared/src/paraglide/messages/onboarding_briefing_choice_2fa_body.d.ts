/**
* | output |
* | --- |
* | "An authenticator app code can be stolen by a fake login page. A hardware security key checks the site address before responding and will not work on a fake s..." |
*
* @param {Onboarding_Briefing_Choice_2fa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_body: ((inputs?: Onboarding_Briefing_Choice_2fa_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_2fa_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_2fa_BodyInputs = {};
