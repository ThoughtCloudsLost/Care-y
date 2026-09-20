/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Managed_LabelInputs */

const en_onboarding_telephony_managed_label = /** @type {(inputs: Onboarding_Telephony_Managed_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up telephony for me`)
};

const es_onboarding_telephony_managed_label = /** @type {(inputs: Onboarding_Telephony_Managed_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar telefonía por mi`)
};

const en_xa2_onboarding_telephony_managed_label = /** @type {(inputs: Onboarding_Telephony_Managed_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp tèlèphòny fòr mè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set up telephony for me" |
*
* @param {Onboarding_Telephony_Managed_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_managed_label = /** @type {((inputs?: Onboarding_Telephony_Managed_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Managed_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_managed_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_managed_label(inputs)
	return en_onboarding_telephony_managed_label(inputs)
});