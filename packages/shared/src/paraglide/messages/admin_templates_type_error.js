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

const en_xa2_admin_templates_type_error = /** @type {(inputs: Admin_Templates_Type_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èrròr rèspònsè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Error response" |
*
* @param {Admin_Templates_Type_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_error = /** @type {((inputs?: Admin_Templates_Type_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Type_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_type_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_type_error(inputs)
	return en_admin_templates_type_error(inputs)
});