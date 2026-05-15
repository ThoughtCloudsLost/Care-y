/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Push_Enroll_VerifyInputs */

const en_twofa_push_enroll_verify = /** @type {(inputs: Twofa_Push_Enroll_VerifyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Test push notification`)
};

const es_twofa_push_enroll_verify = /** @type {(inputs: Twofa_Push_Enroll_VerifyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Probar notificación push`)
};

/**
* | output |
* | --- |
* | "Test push notification" |
*
* @param {Twofa_Push_Enroll_VerifyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_verify = /** @type {((inputs?: Twofa_Push_Enroll_VerifyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_Enroll_VerifyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_push_enroll_verify(inputs)
	return es_twofa_push_enroll_verify(inputs)
});