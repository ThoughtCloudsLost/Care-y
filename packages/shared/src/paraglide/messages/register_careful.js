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

/**
* | output |
* | --- |
* | "Careful" |
*
* @param {Register_CarefulInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const register_careful = /** @type {((inputs?: Register_CarefulInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_CarefulInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_register_careful(inputs)
	return es_register_careful(inputs)
});