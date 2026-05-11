/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Passphrase_Confirm_PlaceholderInputs */

const en_onboarding_escrow_passphrase_confirm_placeholder = /** @type {(inputs: Onboarding_Escrow_Passphrase_Confirm_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Re-enter your passphrase`)
};

const es_onboarding_escrow_passphrase_confirm_placeholder = /** @type {(inputs: Onboarding_Escrow_Passphrase_Confirm_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vuelva a ingresar su frase`)
};

/**
* | output |
* | --- |
* | "Re-enter your passphrase" |
*
* @param {Onboarding_Escrow_Passphrase_Confirm_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_confirm_placeholder = /** @type {((inputs?: Onboarding_Escrow_Passphrase_Confirm_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Passphrase_Confirm_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_passphrase_confirm_placeholder(inputs)
	return es_onboarding_escrow_passphrase_confirm_placeholder(inputs)
});