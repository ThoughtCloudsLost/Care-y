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

const en_xa2_register_warning = /** @type {(inputs: Register_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wàrnìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Warning" |
*
* @param {Register_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const register_warning = /** @type {((inputs?: Register_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_register_warning(inputs)
	if (locale === "en-XA") return en_xa2_register_warning(inputs)
	return en_register_warning(inputs)
});