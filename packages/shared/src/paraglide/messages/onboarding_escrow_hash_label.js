/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Hash_LabelInputs */

const en_onboarding_escrow_hash_label = /** @type {(inputs: Onboarding_Escrow_Hash_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verification code`)
};

const es_onboarding_escrow_hash_label = /** @type {(inputs: Onboarding_Escrow_Hash_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código de verificación`)
};

const en_xa2_onboarding_escrow_hash_label = /** @type {(inputs: Onboarding_Escrow_Hash_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfìcàtìòn còdè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verification code" |
*
* @param {Onboarding_Escrow_Hash_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_label = /** @type {((inputs?: Onboarding_Escrow_Hash_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Hash_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_escrow_hash_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_escrow_hash_label(inputs)
	return en_onboarding_escrow_hash_label(inputs)
});