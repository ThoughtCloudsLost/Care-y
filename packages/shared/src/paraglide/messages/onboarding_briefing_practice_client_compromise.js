/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Client_CompromiseInputs */

const en_onboarding_briefing_practice_client_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Client_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing usable. Decryption requires the volunteer's password and both verification servers cooperating.`)
};

const es_onboarding_briefing_practice_client_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Client_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada utilizable. Descifrar requiere la contrasena del voluntario y la cooperacion de ambos servidores de verificacion.`)
};

/**
* | output |
* | --- |
* | "Nothing usable. Decryption requires the volunteer's password and both verification servers cooperating." |
*
* @param {Onboarding_Briefing_Practice_Client_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_client_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Client_CompromiseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Client_CompromiseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_client_compromise(inputs)
	return es_onboarding_briefing_practice_client_compromise(inputs)
});