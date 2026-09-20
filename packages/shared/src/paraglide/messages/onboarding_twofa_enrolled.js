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

const en_xa2_onboarding_twofa_enrolled = /** @type {(inputs: Onboarding_Twofa_EnrolledInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} mèthòds ènròllèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} methods enrolled" |
*
* @param {Onboarding_Twofa_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_enrolled = /** @type {((inputs: Onboarding_Twofa_EnrolledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_EnrolledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_twofa_enrolled(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_twofa_enrolled(inputs)
	return en_onboarding_twofa_enrolled(inputs)
});