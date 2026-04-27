/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Templates_Type_New_Client_HelpInputs */

const en_admin_templates_type_new_client_help = /** @type {(inputs: Admin_Templates_Type_New_Client_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sent automatically to every incoming text message. Lets the sender know their message was received and a volunteer will follow up.`)
};

const es_admin_templates_type_new_client_help = /** @type {(inputs: Admin_Templates_Type_New_Client_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envia automaticamente a cada mensaje de texto entrante. Informa al remitente que su mensaje fue recibido y que un voluntario dara seguimiento.`)
};

/**
* | output |
* | --- |
* | "Sent automatically to every incoming text message. Lets the sender know their message was received and a volunteer will follow up." |
*
* @param {Admin_Templates_Type_New_Client_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_new_client_help = /** @type {((inputs?: Admin_Templates_Type_New_Client_HelpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Type_New_Client_HelpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_templates_type_new_client_help(inputs)
	return es_admin_templates_type_new_client_help(inputs)
});