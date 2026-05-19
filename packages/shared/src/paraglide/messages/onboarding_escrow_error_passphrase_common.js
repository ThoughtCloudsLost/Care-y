/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Error_Passphrase_CommonInputs */

const en_onboarding_escrow_error_passphrase_common = /** @type {(inputs: Onboarding_Escrow_Error_Passphrase_CommonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This passphrase follows a predictable pattern. Use a more varied phrase.`)
};

const es_onboarding_escrow_error_passphrase_common = /** @type {(inputs: Onboarding_Escrow_Error_Passphrase_CommonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta frase sigue un patron predecible. Use una frase mas variada.`)
};

/**
* | output |
* | --- |
* | "This passphrase follows a predictable pattern. Use a more varied phrase." |
*
* @param {Onboarding_Escrow_Error_Passphrase_CommonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_passphrase_common = /** @type {((inputs?: Onboarding_Escrow_Error_Passphrase_CommonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Error_Passphrase_CommonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_error_passphrase_common(inputs)
	return es_onboarding_escrow_error_passphrase_common(inputs)
});