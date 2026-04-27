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

/**
* | output |
* | --- |
* | "Welcome message" |
*
* @param {Admin_Greetings_Type_AnswerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_answer = /** @type {((inputs?: Admin_Greetings_Type_AnswerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_AnswerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_type_answer(inputs)
	return es_admin_greetings_type_answer(inputs)
});