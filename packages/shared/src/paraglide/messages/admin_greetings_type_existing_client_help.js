/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_Existing_Client_HelpInputs */

const en_admin_greetings_type_existing_client_help = /** @type {(inputs: Admin_Greetings_Type_Existing_Client_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Played for callers the system recognizes.`)
};

const es_admin_greetings_type_existing_client_help = /** @type {(inputs: Admin_Greetings_Type_Existing_Client_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se reproduce para personas que el sistema reconoce.`)
};

/**
* | output |
* | --- |
* | "Played for callers the system recognizes." |
*
* @param {Admin_Greetings_Type_Existing_Client_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_existing_client_help = /** @type {((inputs?: Admin_Greetings_Type_Existing_Client_HelpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Existing_Client_HelpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_type_existing_client_help(inputs)
	return es_admin_greetings_type_existing_client_help(inputs)
});