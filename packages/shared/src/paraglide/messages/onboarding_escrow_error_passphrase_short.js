/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Error_Passphrase_ShortInputs */

const en_onboarding_escrow_error_passphrase_short = /** @type {(inputs: Onboarding_Escrow_Error_Passphrase_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passphrase must be at least 6 words or 20 characters.`)
};

const es_onboarding_escrow_error_passphrase_short = /** @type {(inputs: Onboarding_Escrow_Error_Passphrase_ShortInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La frase debe tener al menos 6 palabras o 20 caracteres.`)
};

/**
* | output |
* | --- |
* | "Passphrase must be at least 6 words or 20 characters." |
*
* @param {Onboarding_Escrow_Error_Passphrase_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_passphrase_short = /** @type {((inputs?: Onboarding_Escrow_Error_Passphrase_ShortInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Error_Passphrase_ShortInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_error_passphrase_short(inputs)
	return es_onboarding_escrow_error_passphrase_short(inputs)
});