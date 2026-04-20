/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_DuplicateInputs */

const en_admin_greetings_duplicate = /** @type {(inputs: Admin_Greetings_DuplicateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A greeting with this type and language already exists.`)
};

const es_admin_greetings_duplicate = /** @type {(inputs: Admin_Greetings_DuplicateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya existe un saludo con este tipo e idioma.`)
};

/**
* | output |
* | --- |
* | "A greeting with this type and language already exists." |
*
* @param {Admin_Greetings_DuplicateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_duplicate = /** @type {((inputs?: Admin_Greetings_DuplicateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_DuplicateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_duplicate(inputs)
	return es_admin_greetings_duplicate(inputs)
});