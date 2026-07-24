/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Register_WarningInputs */

const en_register_warning = /** @type {(inputs: Register_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Warning`)
};

const es_register_warning = /** @type {(inputs: Register_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Advertencia`)
};

/**
* | output |
* | --- |
* | "Warning" |
*
* @param {Register_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const register_warning = /** @type {((inputs?: Register_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_register_warning(inputs)
	return es_register_warning(inputs)
});