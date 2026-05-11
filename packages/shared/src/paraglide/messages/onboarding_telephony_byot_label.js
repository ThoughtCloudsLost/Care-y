/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Byot_LabelInputs */

const en_onboarding_telephony_byot_label = /** @type {(inputs: Onboarding_Telephony_Byot_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`I have a Twilio account`)
};

const es_onboarding_telephony_byot_label = /** @type {(inputs: Onboarding_Telephony_Byot_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tengo una cuenta de Twilio`)
};

/**
* | output |
* | --- |
* | "I have a Twilio account" |
*
* @param {Onboarding_Telephony_Byot_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_byot_label = /** @type {((inputs?: Onboarding_Telephony_Byot_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Byot_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_byot_label(inputs)
	return es_onboarding_telephony_byot_label(inputs)
});