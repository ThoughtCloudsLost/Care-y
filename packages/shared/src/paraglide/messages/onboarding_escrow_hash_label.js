/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Hash_LabelInputs */

const en_onboarding_escrow_hash_label = /** @type {(inputs: Onboarding_Escrow_Hash_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File hash (for verification):`)
};

const es_onboarding_escrow_hash_label = /** @type {(inputs: Onboarding_Escrow_Hash_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hash del archivo (para verificacion):`)
};

/**
* | output |
* | --- |
* | "File hash (for verification):" |
*
* @param {Onboarding_Escrow_Hash_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_label = /** @type {((inputs?: Onboarding_Escrow_Hash_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Hash_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_hash_label(inputs)
	return es_onboarding_escrow_hash_label(inputs)
});