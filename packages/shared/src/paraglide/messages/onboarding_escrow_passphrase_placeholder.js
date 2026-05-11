/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Passphrase_PlaceholderInputs */

const en_onboarding_escrow_passphrase_placeholder = /** @type {(inputs: Onboarding_Escrow_Passphrase_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`At least 6 words or 20 characters`)
};

const es_onboarding_escrow_passphrase_placeholder = /** @type {(inputs: Onboarding_Escrow_Passphrase_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al menos 6 palabras o 20 caracteres`)
};

/**
* | output |
* | --- |
* | "At least 6 words or 20 characters" |
*
* @param {Onboarding_Escrow_Passphrase_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_placeholder = /** @type {((inputs?: Onboarding_Escrow_Passphrase_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Passphrase_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_passphrase_placeholder(inputs)
	return es_onboarding_escrow_passphrase_placeholder(inputs)
});