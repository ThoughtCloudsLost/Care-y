/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_SubtextInputs */

const en_onboarding_telephony_subtext = /** @type {(inputs: Onboarding_Telephony_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose how your organization handles phone calls.`)
};

const es_onboarding_telephony_subtext = /** @type {(inputs: Onboarding_Telephony_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elija como su organización maneja las llamadas telefonicas.`)
};

const en_xa2_onboarding_telephony_subtext = /** @type {(inputs: Onboarding_Telephony_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chòòsè hòw yòùr òrgànìzàtìòn hàndlès phònè càlls. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choose how your organization handles phone calls." |
*
* @param {Onboarding_Telephony_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_subtext = /** @type {((inputs?: Onboarding_Telephony_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_subtext(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_subtext(inputs)
	return en_onboarding_telephony_subtext(inputs)
});