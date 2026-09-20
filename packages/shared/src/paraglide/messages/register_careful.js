/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Register_CarefulInputs */

const en_register_careful = /** @type {(inputs: Register_CarefulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Careful`)
};

const es_register_careful = /** @type {(inputs: Register_CarefulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuidado`)
};

const en_xa2_register_careful = /** @type {(inputs: Register_CarefulInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càrèfùl •••⟧`)
};

/**
* | output |
* | --- |
* | "Careful" |
*
* @param {Register_CarefulInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const register_careful = /** @type {((inputs?: Register_CarefulInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_CarefulInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_register_careful(inputs)
	if (locale === "en-XA") return en_xa2_register_careful(inputs)
	return en_register_careful(inputs)
});