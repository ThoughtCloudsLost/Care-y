/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_HeadingInputs */

const en_onboarding_briefing_heading = /** @type {(inputs: Onboarding_Briefing_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How CARE-Y Protects Your Data`)
};

const es_onboarding_briefing_heading = /** @type {(inputs: Onboarding_Briefing_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como CARE-Y protege tus datos`)
};

const en_xa2_onboarding_briefing_heading = /** @type {(inputs: Onboarding_Briefing_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw CÀRÈ-Y Pròtècts Yòùr Dàtà •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "How CARE-Y Protects Your Data" |
*
* @param {Onboarding_Briefing_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_heading = /** @type {((inputs?: Onboarding_Briefing_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_heading(inputs)
	return en_onboarding_briefing_heading(inputs)
});