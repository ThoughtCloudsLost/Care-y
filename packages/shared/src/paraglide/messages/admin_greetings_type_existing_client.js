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

/**
* | output |
* | --- |
* | "Returning caller" |
*
* @param {Admin_Greetings_Type_Existing_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_existing_client = /** @type {((inputs?: Admin_Greetings_Type_Existing_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Existing_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_type_existing_client(inputs)
	return es_admin_greetings_type_existing_client(inputs)
});