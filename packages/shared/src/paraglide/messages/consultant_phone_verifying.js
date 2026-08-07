/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_VerifyingInputs */

const en_consultant_phone_verifying = /** @type {(inputs: Consultant_Phone_VerifyingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verifying...`)
};

const es_consultant_phone_verifying = /** @type {(inputs: Consultant_Phone_VerifyingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificando...`)
};

/**
* | output |
* | --- |
* | "Verifying..." |
*
* @param {Consultant_Phone_VerifyingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verifying = /** @type {((inputs?: Consultant_Phone_VerifyingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_VerifyingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_verifying(inputs)
	return es_consultant_phone_verifying(inputs)
});