/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Client_CompromiseInputs */

const en_onboarding_briefing_practice_client_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Client_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing usable. Decryption requires the volunteer's password and both verification servers cooperating.`)
};

const es_onboarding_briefing_practice_client_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Client_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada utilizable. Descifrar requiere la contraseña del voluntario y la cooperación de ambos servidores de verificación.`)
};

const en_xa2_onboarding_briefing_practice_client_compromise = /** @type {(inputs: Onboarding_Briefing_Practice_Client_CompromiseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng ùsàblè. Dècryptìòn rèqùìrès thè vòlùntèèr's pàsswòrd ànd bòth vèrìfìcàtìòn sèrvèrs còòpèràtìng. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing usable. Decryption requires the volunteer's password and both verification servers cooperating." |
*
* @param {Onboarding_Briefing_Practice_Client_CompromiseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_client_compromise = /** @type {((inputs?: Onboarding_Briefing_Practice_Client_CompromiseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Client_CompromiseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_client_compromise(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_client_compromise(inputs)
	return en_onboarding_briefing_practice_client_compromise(inputs)
});