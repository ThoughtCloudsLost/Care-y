/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Managed_LabelInputs */

const en_onboarding_telephony_managed_label = /** @type {(inputs: Onboarding_Telephony_Managed_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up telephony for me`)
};

const es_onboarding_telephony_managed_label = /** @type {(inputs: Onboarding_Telephony_Managed_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar telefonia por mi`)
};

/**
* | output |
* | --- |
* | "Set up telephony for me" |
*
* @param {Onboarding_Telephony_Managed_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_managed_label = /** @type {((inputs?: Onboarding_Telephony_Managed_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Managed_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_managed_label(inputs)
	return es_onboarding_telephony_managed_label(inputs)
});