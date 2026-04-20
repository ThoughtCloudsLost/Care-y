/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Type_Error_HelpInputs */

const en_admin_templates_type_error_help = /** @type {(inputs: Admin_Templates_Type_Error_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sent when the system cannot process an incoming message.`)
};

const es_admin_templates_type_error_help = /** @type {(inputs: Admin_Templates_Type_Error_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviado cuando el sistema no puede procesar un mensaje entrante.`)
};

/**
* | output |
* | --- |
* | "Sent when the system cannot process an incoming message." |
*
* @param {Admin_Templates_Type_Error_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_error_help = /** @type {((inputs?: Admin_Templates_Type_Error_HelpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Type_Error_HelpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_type_error_help(inputs)
	return es_admin_templates_type_error_help(inputs)
});