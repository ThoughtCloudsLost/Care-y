/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Skip_LabelInputs */

const en_onboarding_telephony_skip_label = /** @type {(inputs: Onboarding_Telephony_Skip_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure later`)
};

const es_onboarding_telephony_skip_label = /** @type {(inputs: Onboarding_Telephony_Skip_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar después`)
};

const en_xa2_onboarding_telephony_skip_label = /** @type {(inputs: Onboarding_Telephony_Skip_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìgùrè làtèr •••••⟧`)
};

/**
* | output |
* | --- |
* | "Configure later" |
*
* @param {Onboarding_Telephony_Skip_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_skip_label = /** @type {((inputs?: Onboarding_Telephony_Skip_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Skip_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_skip_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_skip_label(inputs)
	return en_onboarding_telephony_skip_label(inputs)
});