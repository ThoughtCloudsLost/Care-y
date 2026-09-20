/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Col_AccessInputs */

const en_onboarding_briefing_practice_col_access = /** @type {(inputs: Onboarding_Briefing_Practice_Col_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Who can read it`)
};

const es_onboarding_briefing_practice_col_access = /** @type {(inputs: Onboarding_Briefing_Practice_Col_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quién puede leerlo`)
};

const en_xa2_onboarding_briefing_practice_col_access = /** @type {(inputs: Onboarding_Briefing_Practice_Col_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whò càn rèàd ìt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Who can read it" |
*
* @param {Onboarding_Briefing_Practice_Col_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_col_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Col_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Col_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_col_access(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_col_access(inputs)
	return en_onboarding_briefing_practice_col_access(inputs)
});