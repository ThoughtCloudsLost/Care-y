/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Branding_DataInputs */

const en_onboarding_briefing_practice_branding_data = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Public branding (logo, name, color on intake pages)`)
};

const es_onboarding_briefing_practice_branding_data = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca pública (logo, nombre, color en páginas de contacto)`)
};

const en_xa2_onboarding_briefing_practice_branding_data = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pùblìc bràndìng (lògò, nàmè, còlòr òn ìntàkè pàgès) ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Public branding (logo, name, color on intake pages)" |
*
* @param {Onboarding_Briefing_Practice_Branding_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_branding_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Branding_DataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Branding_DataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_branding_data(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_branding_data(inputs)
	return en_onboarding_briefing_practice_branding_data(inputs)
});