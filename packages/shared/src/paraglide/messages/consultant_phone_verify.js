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

const en_xa2_consultant_phone_verify = /** @type {(inputs: Consultant_Phone_VerifyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfy ••⟧`)
};

/**
* | output |
* | --- |
* | "Verify" |
*
* @param {Consultant_Phone_VerifyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verify = /** @type {((inputs?: Consultant_Phone_VerifyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_VerifyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_verify(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_verify(inputs)
	return en_consultant_phone_verify(inputs)
});