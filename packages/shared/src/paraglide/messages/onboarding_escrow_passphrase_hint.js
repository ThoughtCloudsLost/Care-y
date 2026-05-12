/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Passphrase_HintInputs */

const en_onboarding_escrow_passphrase_hint = /** @type {(inputs: Onboarding_Escrow_Passphrase_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use at least 6 words or 20 characters. A random phrase like "correct horse battery staple river lamp" is strong and easy to remember.`)
};

const es_onboarding_escrow_passphrase_hint = /** @type {(inputs: Onboarding_Escrow_Passphrase_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usa al menos 6 palabras o 20 caracteres. Una frase al azar como "caballo correcto bateria grapa rio lampara" es fuerte y facil de recordar.`)
};

/**
* | output |
* | --- |
* | "Use at least 6 words or 20 characters. A random phrase like \"correct horse battery staple river lamp\" is strong and easy to remember." |
*
* @param {Onboarding_Escrow_Passphrase_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_hint = /** @type {((inputs?: Onboarding_Escrow_Passphrase_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Passphrase_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_passphrase_hint(inputs)
	return es_onboarding_escrow_passphrase_hint(inputs)
});