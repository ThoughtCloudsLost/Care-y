/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Sid_PlaceholderInputs */

const en_onboarding_telephony_sid_placeholder = /** @type {(inputs: Onboarding_Telephony_Sid_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
};

const es_onboarding_telephony_sid_placeholder = /** @type {(inputs: Onboarding_Telephony_Sid_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
};

/**
* | output |
* | --- |
* | "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" |
*
* @param {Onboarding_Telephony_Sid_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_sid_placeholder = /** @type {((inputs?: Onboarding_Telephony_Sid_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Sid_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_sid_placeholder(inputs)
	return es_onboarding_telephony_sid_placeholder(inputs)
});