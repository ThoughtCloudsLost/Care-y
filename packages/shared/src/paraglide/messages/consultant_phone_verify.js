/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_VerifyInputs */

const en_consultant_phone_verify = /** @type {(inputs: Consultant_Phone_VerifyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify`)
};

const es_consultant_phone_verify = /** @type {(inputs: Consultant_Phone_VerifyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificar`)
};

/**
* | output |
* | --- |
* | "Verify" |
*
* @param {Consultant_Phone_VerifyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verify = /** @type {((inputs?: Consultant_Phone_VerifyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_VerifyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_verify(inputs)
	return es_consultant_phone_verify(inputs)
});