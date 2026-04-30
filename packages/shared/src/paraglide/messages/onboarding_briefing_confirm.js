/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_ConfirmInputs */

const en_onboarding_briefing_confirm = /** @type {(inputs: Onboarding_Briefing_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`I understand`)
};

const es_onboarding_briefing_confirm = /** @type {(inputs: Onboarding_Briefing_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entiendo`)
};

/**
* | output |
* | --- |
* | "I understand" |
*
* @param {Onboarding_Briefing_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_confirm = /** @type {((inputs?: Onboarding_Briefing_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_confirm(inputs)
	return es_onboarding_briefing_confirm(inputs)
});