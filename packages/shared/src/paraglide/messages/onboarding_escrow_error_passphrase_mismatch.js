/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Error_Passphrase_MismatchInputs */

const en_onboarding_escrow_error_passphrase_mismatch = /** @type {(inputs: Onboarding_Escrow_Error_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passphrases do not match.`)
};

const es_onboarding_escrow_error_passphrase_mismatch = /** @type {(inputs: Onboarding_Escrow_Error_Passphrase_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las frases no coinciden.`)
};

/**
* | output |
* | --- |
* | "Passphrases do not match." |
*
* @param {Onboarding_Escrow_Error_Passphrase_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_passphrase_mismatch = /** @type {((inputs?: Onboarding_Escrow_Error_Passphrase_MismatchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Error_Passphrase_MismatchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_error_passphrase_mismatch(inputs)
	return es_onboarding_escrow_error_passphrase_mismatch(inputs)
});