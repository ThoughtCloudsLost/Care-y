/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Type_Answer_HelpInputs */

const en_admin_greetings_type_answer_help = /** @type {(inputs: Admin_Greetings_Type_Answer_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This is what callers hear when they first connect.`)
};

const es_admin_greetings_type_answer_help = /** @type {(inputs: Admin_Greetings_Type_Answer_HelpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Es lo que escuchan las personas cuando se conectan por primera vez.`)
};

/**
* | output |
* | --- |
* | "This is what callers hear when they first connect." |
*
* @param {Admin_Greetings_Type_Answer_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_answer_help = /** @type {((inputs?: Admin_Greetings_Type_Answer_HelpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Type_Answer_HelpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_type_answer_help(inputs)
	return es_admin_greetings_type_answer_help(inputs)
});