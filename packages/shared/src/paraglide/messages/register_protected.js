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

const en_xa2_register_protected = /** @type {(inputs: Register_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pròtèctèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Protected" |
*
* @param {Register_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const register_protected = /** @type {((inputs?: Register_ProtectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_ProtectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_register_protected(inputs)
	if (locale === "en-XA") return en_xa2_register_protected(inputs)
	return en_register_protected(inputs)
});