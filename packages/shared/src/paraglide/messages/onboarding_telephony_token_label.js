/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Token_LabelInputs */

const en_onboarding_telephony_token_label = /** @type {(inputs: Onboarding_Telephony_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auth Token`)
};

const es_onboarding_telephony_token_label = /** @type {(inputs: Onboarding_Telephony_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auth Token`)
};

const en_xa2_onboarding_telephony_token_label = /** @type {(inputs: Onboarding_Telephony_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùth Tòkèn •••⟧`)
};

/**
* | output |
* | --- |
* | "Auth Token" |
*
* @param {Onboarding_Telephony_Token_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_token_label = /** @type {((inputs?: Onboarding_Telephony_Token_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Token_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_token_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_token_label(inputs)
	return en_onboarding_telephony_token_label(inputs)
});