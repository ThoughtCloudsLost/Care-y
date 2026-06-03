/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Diagram_TapInputs */

const en_onboarding_briefing_diagram_tap = /** @type {(inputs: Onboarding_Briefing_Diagram_TapInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap to view full size`)
};

const es_onboarding_briefing_diagram_tap = /** @type {(inputs: Onboarding_Briefing_Diagram_TapInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca para ver a tamano completo`)
};

/**
* | output |
* | --- |
* | "Tap to view full size" |
*
* @param {Onboarding_Briefing_Diagram_TapInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_diagram_tap = /** @type {((inputs?: Onboarding_Briefing_Diagram_TapInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Diagram_TapInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_diagram_tap(inputs)
	return es_onboarding_briefing_diagram_tap(inputs)
});