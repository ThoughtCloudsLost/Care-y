/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_TelephonyInputs */

const en_onboarding_step_telephony = /** @type {(inputs: Onboarding_Step_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_onboarding_step_telephony = /** @type {(inputs: Onboarding_Step_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonia`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Onboarding_Step_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_telephony = /** @type {((inputs?: Onboarding_Step_TelephonyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_TelephonyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_telephony(inputs)
	return es_onboarding_step_telephony(inputs)
});