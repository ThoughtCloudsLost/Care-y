/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_New_Client_HelpInputs */

const en_admin_greetings_type_new_client_help = /** @type {(inputs: Admin_Greetings_Type_New_Client_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Played for callers who have never called before.`)
};

const es_admin_greetings_type_new_client_help = /** @type {(inputs: Admin_Greetings_Type_New_Client_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se reproduce para personas que llaman por primera vez.`)
};

const en_xa2_admin_greetings_type_new_client_help = /** @type {(inputs: Admin_Greetings_Type_New_Client_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plàyèd fòr càllèrs whò hàvè nèvèr càllèd bèfòrè. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Played for callers who have never called before." |
*
* @param {Admin_Greetings_Type_New_Client_HelpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_new_client_help = /** @type {((inputs?: Admin_Greetings_Type_New_Client_HelpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_New_Client_HelpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_type_new_client_help(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_type_new_client_help(inputs)
	return en_admin_greetings_type_new_client_help(inputs)
});