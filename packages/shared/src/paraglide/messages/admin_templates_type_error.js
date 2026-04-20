/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Type_ErrorInputs */

const en_admin_templates_type_error = /** @type {(inputs: Admin_Templates_Type_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error response`)
};

const es_admin_templates_type_error = /** @type {(inputs: Admin_Templates_Type_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta de error`)
};

/**
* | output |
* | --- |
* | "Error response" |
*
* @param {Admin_Templates_Type_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_error = /** @type {((inputs?: Admin_Templates_Type_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Type_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_type_error(inputs)
	return es_admin_templates_type_error(inputs)
});