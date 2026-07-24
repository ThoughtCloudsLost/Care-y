/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Onboarding_Twofa_EnrolledInputs */

const en_onboarding_twofa_enrolled = /** @type {(inputs: Onboarding_Twofa_EnrolledInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} methods enrolled`)
};

const es_onboarding_twofa_enrolled = /** @type {(inputs: Onboarding_Twofa_EnrolledInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} métodos registrados`)
};

/**
* | output |
* | --- |
* | "{count} methods enrolled" |
*
* @param {Onboarding_Twofa_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_enrolled = /** @type {((inputs: Onboarding_Twofa_EnrolledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_EnrolledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_enrolled(inputs)
	return es_onboarding_twofa_enrolled(inputs)
});