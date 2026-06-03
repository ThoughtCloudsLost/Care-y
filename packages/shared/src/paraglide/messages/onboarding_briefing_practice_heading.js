/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_HeadingInputs */

const en_onboarding_briefing_practice_heading = /** @type {(inputs: Onboarding_Briefing_Practice_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What This Means in Practice`)
};

const es_onboarding_briefing_practice_heading = /** @type {(inputs: Onboarding_Briefing_Practice_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Que significa esto en la practica`)
};

/**
* | output |
* | --- |
* | "What This Means in Practice" |
*
* @param {Onboarding_Briefing_Practice_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_heading = /** @type {((inputs?: Onboarding_Briefing_Practice_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_heading(inputs)
	return es_onboarding_briefing_practice_heading(inputs)
});