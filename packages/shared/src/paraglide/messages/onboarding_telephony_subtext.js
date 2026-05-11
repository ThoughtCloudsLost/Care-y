/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_SubtextInputs */

const en_onboarding_telephony_subtext = /** @type {(inputs: Onboarding_Telephony_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose how your organization handles phone calls.`)
};

const es_onboarding_telephony_subtext = /** @type {(inputs: Onboarding_Telephony_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elija como su organizacion maneja las llamadas telefonicas.`)
};

/**
* | output |
* | --- |
* | "Choose how your organization handles phone calls." |
*
* @param {Onboarding_Telephony_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_subtext = /** @type {((inputs?: Onboarding_Telephony_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_subtext(inputs)
	return es_onboarding_telephony_subtext(inputs)
});