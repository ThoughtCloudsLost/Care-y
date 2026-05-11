/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Skip_LabelInputs */

const en_onboarding_telephony_skip_label = /** @type {(inputs: Onboarding_Telephony_Skip_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure later`)
};

const es_onboarding_telephony_skip_label = /** @type {(inputs: Onboarding_Telephony_Skip_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar despues`)
};

/**
* | output |
* | --- |
* | "Configure later" |
*
* @param {Onboarding_Telephony_Skip_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_skip_label = /** @type {((inputs?: Onboarding_Telephony_Skip_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Skip_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_skip_label(inputs)
	return es_onboarding_telephony_skip_label(inputs)
});