/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_No_PhonesInputs */

const en_admin_greetings_no_phones = /** @type {(inputs: Admin_Greetings_No_PhonesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up phone numbers in the Telephony section before adding greetings.`)
};

const es_admin_greetings_no_phones = /** @type {(inputs: Admin_Greetings_No_PhonesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure los numeros de telefono en la seccion de Telefonia antes de agregar saludos.`)
};

/**
* | output |
* | --- |
* | "Set up phone numbers in the Telephony section before adding greetings." |
*
* @param {Admin_Greetings_No_PhonesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_no_phones = /** @type {((inputs?: Admin_Greetings_No_PhonesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_No_PhonesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_no_phones(inputs)
	return es_admin_greetings_no_phones(inputs)
});