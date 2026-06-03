/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Vol_DataInputs */

const en_onboarding_briefing_practice_vol_data = /** @type {(inputs: Onboarding_Briefing_Practice_Vol_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer display names, IP addresses, session details`)
};

const es_onboarding_briefing_practice_vol_data = /** @type {(inputs: Onboarding_Briefing_Practice_Vol_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombres de voluntarios, direcciones IP, detalles de sesion`)
};

/**
* | output |
* | --- |
* | "Volunteer display names, IP addresses, session details" |
*
* @param {Onboarding_Briefing_Practice_Vol_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_vol_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Vol_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Vol_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_vol_data(inputs)
	return es_onboarding_briefing_practice_vol_data(inputs)
});