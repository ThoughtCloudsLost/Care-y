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

const en_xa2_twofa_push_enroll_verify = /** @type {(inputs: Twofa_Push_Enroll_VerifyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèst pùsh nòtìfìcàtìòn •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Test push notification" |
*
* @param {Twofa_Push_Enroll_VerifyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_verify = /** @type {((inputs?: Twofa_Push_Enroll_VerifyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Push_Enroll_VerifyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_push_enroll_verify(inputs)
	if (locale === "en-XA") return en_xa2_twofa_push_enroll_verify(inputs)
	return en_twofa_push_enroll_verify(inputs)
});