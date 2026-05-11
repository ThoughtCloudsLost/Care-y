/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Passphrase_LabelInputs */

const en_onboarding_escrow_passphrase_label = /** @type {(inputs: Onboarding_Escrow_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Backup Passphrase`)
};

const es_onboarding_escrow_passphrase_label = /** @type {(inputs: Onboarding_Escrow_Passphrase_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Frase de respaldo`)
};

/**
* | output |
* | --- |
* | "Backup Passphrase" |
*
* @param {Onboarding_Escrow_Passphrase_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_label = /** @type {((inputs?: Onboarding_Escrow_Passphrase_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Passphrase_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_passphrase_label(inputs)
	return es_onboarding_escrow_passphrase_label(inputs)
});