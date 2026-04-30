/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Col_AccessInputs */

const en_onboarding_briefing_practice_col_access = /** @type {(inputs: Onboarding_Briefing_Practice_Col_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Who can read it`)
};

const es_onboarding_briefing_practice_col_access = /** @type {(inputs: Onboarding_Briefing_Practice_Col_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quien puede leerlo`)
};

/**
* | output |
* | --- |
* | "Who can read it" |
*
* @param {Onboarding_Briefing_Practice_Col_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_col_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Col_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Col_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_col_access(inputs)
	return es_onboarding_briefing_practice_col_access(inputs)
});