/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Placeholder_Heading_TelephonyInputs */

const en_onboarding_placeholder_heading_telephony = /** @type {(inputs: Onboarding_Placeholder_Heading_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_onboarding_placeholder_heading_telephony = /** @type {(inputs: Onboarding_Placeholder_Heading_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonia`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Onboarding_Placeholder_Heading_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_heading_telephony = /** @type {((inputs?: Onboarding_Placeholder_Heading_TelephonyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Placeholder_Heading_TelephonyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_placeholder_heading_telephony(inputs)
	return es_onboarding_placeholder_heading_telephony(inputs)
});