/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scroll_HintInputs */

const en_onboarding_briefing_scroll_hint = /** @type {(inputs: Onboarding_Briefing_Scroll_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Scroll to the bottom to continue`)
};

const es_onboarding_briefing_scroll_hint = /** @type {(inputs: Onboarding_Briefing_Scroll_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desplazate hasta el final para continuar`)
};

/**
* | output |
* | --- |
* | "Scroll to the bottom to continue" |
*
* @param {Onboarding_Briefing_Scroll_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scroll_hint = /** @type {((inputs?: Onboarding_Briefing_Scroll_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scroll_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scroll_hint(inputs)
	return es_onboarding_briefing_scroll_hint(inputs)
});