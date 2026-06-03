/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Branding_DataInputs */

const en_onboarding_briefing_practice_branding_data = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Public branding (logo, name, color on intake pages)`)
};

const es_onboarding_briefing_practice_branding_data = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Marca publica (logo, nombre, color en paginas de contacto)`)
};

/**
* | output |
* | --- |
* | "Public branding (logo, name, color on intake pages)" |
*
* @param {Onboarding_Briefing_Practice_Branding_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_branding_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Branding_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Branding_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_branding_data(inputs)
	return es_onboarding_briefing_practice_branding_data(inputs)
});