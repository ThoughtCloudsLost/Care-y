/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_HeadingInputs */

const en_onboarding_telephony_heading = /** @type {(inputs: Onboarding_Telephony_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_onboarding_telephony_heading = /** @type {(inputs: Onboarding_Telephony_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonia`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Onboarding_Telephony_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_heading = /** @type {((inputs?: Onboarding_Telephony_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_heading(inputs)
	return es_onboarding_telephony_heading(inputs)
});