/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_HeadingInputs */

const en_onboarding_telephony_heading = /** @type {(inputs: Onboarding_Telephony_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_onboarding_telephony_heading = /** @type {(inputs: Onboarding_Telephony_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonía`)
};

const en_xa2_onboarding_telephony_heading = /** @type {(inputs: Onboarding_Telephony_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèlèphòny •••⟧`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Onboarding_Telephony_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_heading = /** @type {((inputs?: Onboarding_Telephony_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_heading(inputs)
	return en_onboarding_telephony_heading(inputs)
});