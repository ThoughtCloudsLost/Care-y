/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_AnswerInputs */

const en_admin_greetings_type_answer = /** @type {(inputs: Admin_Greetings_Type_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Welcome message`)
};

const es_admin_greetings_type_answer = /** @type {(inputs: Admin_Greetings_Type_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje de bienvenida`)
};

const en_xa2_admin_greetings_type_answer = /** @type {(inputs: Admin_Greetings_Type_AnswerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wèlcòmè mèssàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Welcome message" |
*
* @param {Admin_Greetings_Type_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_answer = /** @type {((inputs?: Admin_Greetings_Type_AnswerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_AnswerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_type_answer(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_type_answer(inputs)
	return en_admin_greetings_type_answer(inputs)
});