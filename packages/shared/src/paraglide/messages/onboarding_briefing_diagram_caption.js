/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Diagram_CaptionInputs */

const en_onboarding_briefing_diagram_caption = /** @type {(inputs: Onboarding_Briefing_Diagram_CaptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How your password becomes encryption keys`)
};

const es_onboarding_briefing_diagram_caption = /** @type {(inputs: Onboarding_Briefing_Diagram_CaptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como tu contrasena se convierte en claves de cifrado`)
};

/**
* | output |
* | --- |
* | "How your password becomes encryption keys" |
*
* @param {Onboarding_Briefing_Diagram_CaptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_diagram_caption = /** @type {((inputs?: Onboarding_Briefing_Diagram_CaptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Diagram_CaptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_diagram_caption(inputs)
	return es_onboarding_briefing_diagram_caption(inputs)
});