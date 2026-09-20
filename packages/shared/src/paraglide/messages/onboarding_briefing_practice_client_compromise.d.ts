/**
* | output |
* | --- |
* | "Nothing usable. Decryption requires the volunteer's password and both verification servers cooperating." |
*
* @param {Onboarding_Briefing_Practice_Client_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_client_compromise: ((inputs?: Onboarding_Briefing_Practice_Client_CompromiseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Practice_Client_CompromiseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Practice_Client_CompromiseInputs = {};
