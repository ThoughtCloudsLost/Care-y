/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_Existing_ClientInputs */

const en_admin_greetings_type_existing_client = /** @type {(inputs: Admin_Greetings_Type_Existing_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Returning caller`)
};

const es_admin_greetings_type_existing_client = /** @type {(inputs: Admin_Greetings_Type_Existing_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamada recurrente`)
};

const en_xa2_admin_greetings_type_existing_client = /** @type {(inputs: Admin_Greetings_Type_Existing_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètùrnìng càllèr •••••⟧`)
};

/**
* | output |
* | --- |
* | "Returning caller" |
*
* @param {Admin_Greetings_Type_Existing_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_existing_client = /** @type {((inputs?: Admin_Greetings_Type_Existing_ClientInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Existing_ClientInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_type_existing_client(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_type_existing_client(inputs)
	return en_admin_greetings_type_existing_client(inputs)
});