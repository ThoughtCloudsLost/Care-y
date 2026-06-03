/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Verify_SubmitInputs */

const en_twofa_verify_submit = /** @type {(inputs: Twofa_Verify_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify`)
};

const es_twofa_verify_submit = /** @type {(inputs: Twofa_Verify_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificar`)
};

/**
* | output |
* | --- |
* | "Verify" |
*
* @param {Twofa_Verify_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_verify_submit = /** @type {((inputs?: Twofa_Verify_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Verify_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_twofa_verify_submit(inputs)
	return es_twofa_verify_submit(inputs)
});