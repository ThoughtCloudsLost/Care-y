/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteer: NonNullable<unknown> }} Admin_Templates_Type_New_Client_HelpInputs */

const en_admin_templates_type_new_client_help = /** @type {(inputs: Admin_Templates_Type_New_Client_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sent automatically to every incoming text message. Lets the sender know their message was received and a ${i?.volunteer} will follow up.`)
};

const es_admin_templates_type_new_client_help = /** @type {(inputs: Admin_Templates_Type_New_Client_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se envia automáticamente a cada mensaje de texto entrante. Informa al remitente que su mensaje fue recibido y que un ${i?.volunteer} dará seguimiento.`)
};

const en_xa2_admin_templates_type_new_client_help = /** @type {(inputs: Admin_Templates_Type_New_Client_HelpInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sènt àùtòmàtìcàlly tò èvèry ìncòmìng tèxt mèssàgè. Lèts thè sèndèr knòw thèìr mèssàgè wàs rècèìvèd ànd à  ••••••••••••••••••••••••••••••••${i?.volunteer} wìll fòllòw ùp. •••••⟧`)
};

/**
* | output |
* | --- |
* | "Sent automatically to every incoming text message. Lets the sender know their message was received and a {volunteer} will follow up." |
*
* @param {Admin_Templates_Type_New_Client_HelpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_new_client_help = /** @type {((inputs: Admin_Templates_Type_New_Client_HelpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Templates_Type_New_Client_HelpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_templates_type_new_client_help(inputs)
	if (locale === "en-XA") return en_xa2_admin_templates_type_new_client_help(inputs)
	return en_admin_templates_type_new_client_help(inputs)
});