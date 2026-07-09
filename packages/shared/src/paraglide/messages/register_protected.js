/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Register_ProtectedInputs */

const en_register_protected = /** @type {(inputs: Register_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protected`)
};

const es_register_protected = /** @type {(inputs: Register_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protegido`)
};

/**
* | output |
* | --- |
* | "Protected" |
*
* @param {Register_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const register_protected = /** @type {((inputs?: Register_ProtectedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_ProtectedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_register_protected(inputs)
	return es_register_protected(inputs)
});