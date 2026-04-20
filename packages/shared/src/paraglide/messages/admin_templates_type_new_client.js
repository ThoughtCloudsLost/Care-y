/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Type_New_ClientInputs */

const en_admin_templates_type_new_client = /** @type {(inputs: Admin_Templates_Type_New_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Auto-reply`)
};

const es_admin_templates_type_new_client = /** @type {(inputs: Admin_Templates_Type_New_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta automatica`)
};

/**
* | output |
* | --- |
* | "Auto-reply" |
*
* @param {Admin_Templates_Type_New_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_new_client = /** @type {((inputs?: Admin_Templates_Type_New_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Type_New_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_type_new_client(inputs)
	return es_admin_templates_type_new_client(inputs)
});