/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_Enrolled_OneInputs */

const en_onboarding_twofa_enrolled_one = /** @type {(inputs: Onboarding_Twofa_Enrolled_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 method enrolled`)
};

const es_onboarding_twofa_enrolled_one = /** @type {(inputs: Onboarding_Twofa_Enrolled_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 método registrado`)
};

/**
* | output |
* | --- |
* | "1 method enrolled" |
*
* @param {Onboarding_Twofa_Enrolled_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_enrolled_one = /** @type {((inputs?: Onboarding_Twofa_Enrolled_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_Enrolled_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_enrolled_one(inputs)
	return es_onboarding_twofa_enrolled_one(inputs)
});