/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Col_ProtectedInputs */

const en_onboarding_briefing_practice_col_protected = /** @type {(inputs: Onboarding_Briefing_Practice_Col_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What's protected`)
};

const es_onboarding_briefing_practice_col_protected = /** @type {(inputs: Onboarding_Briefing_Practice_Col_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Que esta protegido`)
};

/**
* | output |
* | --- |
* | "What's protected" |
*
* @param {Onboarding_Briefing_Practice_Col_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_col_protected = /** @type {((inputs?: Onboarding_Briefing_Practice_Col_ProtectedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Col_ProtectedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_col_protected(inputs)
	return es_onboarding_briefing_practice_col_protected(inputs)
});