/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Sid_LabelInputs */

const en_onboarding_telephony_sid_label = /** @type {(inputs: Onboarding_Telephony_Sid_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account SID`)
};

const es_onboarding_telephony_sid_label = /** @type {(inputs: Onboarding_Telephony_Sid_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account SID`)
};

const en_xa2_onboarding_telephony_sid_label = /** @type {(inputs: Onboarding_Telephony_Sid_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt SÌD ••••⟧`)
};

/**
* | output |
* | --- |
* | "Account SID" |
*
* @param {Onboarding_Telephony_Sid_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_sid_label = /** @type {((inputs?: Onboarding_Telephony_Sid_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Sid_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_sid_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_sid_label(inputs)
	return en_onboarding_telephony_sid_label(inputs)
});