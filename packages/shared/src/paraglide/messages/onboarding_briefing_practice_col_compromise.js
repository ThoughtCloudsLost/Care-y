/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Col_CompromiseInputs */

const en_onboarding_briefing_practice_col_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Col_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If this server is seized`)
};

const es_onboarding_briefing_practice_col_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Col_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si este servidor es confiscado`)
};

/**
* | output |
* | --- |
* | "If this server is seized" |
*
* @param {Onboarding_Briefing_Practice_Col_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_col_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Col_CompromiseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Col_CompromiseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_col_compromise(inputs)
	return es_onboarding_briefing_practice_col_compromise(inputs)
});