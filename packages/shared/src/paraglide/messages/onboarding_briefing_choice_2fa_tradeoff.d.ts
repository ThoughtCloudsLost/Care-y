/**
* | output |
* | --- |
* | "An authenticator app is easy to set up but can still be tricked by a convincing fake login page. A hardware security key (like a YubiKey) checks the website ..." |
*
* @param {Onboarding_Briefing_Choice_2fa_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_2fa_tradeoff: ((inputs?: Onboarding_Briefing_Choice_2fa_TradeoffInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_2fa_TradeoffInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_2fa_TradeoffInputs = {};
