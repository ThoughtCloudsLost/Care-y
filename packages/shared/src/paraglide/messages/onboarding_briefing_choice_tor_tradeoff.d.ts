/**
* | output |
* | --- |
* | "With Tor enabled, users who connect through Tor Browser hide their connection completely. The downside is that Tor is noticeably slower, which can frustrate ..." |
*
* @param {Onboarding_Briefing_Choice_Tor_TradeoffInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_tor_tradeoff: ((inputs?: Onboarding_Briefing_Choice_Tor_TradeoffInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Choice_Tor_TradeoffInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Choice_Tor_TradeoffInputs = {};
