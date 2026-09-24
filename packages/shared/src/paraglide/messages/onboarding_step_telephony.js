/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_TelephonyInputs */

const en_onboarding_step_telephony = /** @type {(inputs: Onboarding_Step_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony`)
};

const es_onboarding_step_telephony = /** @type {(inputs: Onboarding_Step_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefonía`)
};

const en_xa2_onboarding_step_telephony = /** @type {(inputs: Onboarding_Step_TelephonyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèlèphòny •••⟧`)
};

/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Onboarding_Step_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_telephony = /** @type {((inputs?: Onboarding_Step_TelephonyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_TelephonyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_telephony(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_telephony(inputs)
	return en_onboarding_step_telephony(inputs)
});