/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ hash: NonNullable<unknown> }} Onboarding_Escrow_Hash_ValueInputs */

const en_onboarding_escrow_hash_value = /** @type {(inputs: Onboarding_Escrow_Hash_ValueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.hash}`)
};

const es_onboarding_escrow_hash_value = /** @type {(inputs: Onboarding_Escrow_Hash_ValueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.hash}`)
};

/**
* | output |
* | --- |
* | "{hash}" |
*
* @param {Onboarding_Escrow_Hash_ValueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_value = /** @type {((inputs: Onboarding_Escrow_Hash_ValueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Hash_ValueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_hash_value(inputs)
	return es_onboarding_escrow_hash_value(inputs)
});