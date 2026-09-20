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

const en_xa2_admin_templates_type_error_help = /** @type {(inputs: Admin_Templates_Type_Error_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènt whèn thè systèm cànnòt pròcèss àn ìncòmìng mèssàgè. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Sent when the system cannot process an incoming message." |
*
* @param {Admin_Templates_Type_Error_HelpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_error_help = /** @type {((inputs?: Admin_Templates_Type_Error_HelpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Type_Error_HelpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_type_error_help(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_type_error_help(inputs)
	return en_admin_templates_type_error_help(inputs)
});