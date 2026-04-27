/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_EmptyInputs */

const en_admin_greetings_empty = /** @type {(inputs: Admin_Greetings_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No greetings yet.`)
};

const es_admin_greetings_empty = /** @type {(inputs: Admin_Greetings_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aun no hay saludos.`)
};

/**
* | output |
* | --- |
* | "No greetings yet." |
*
* @param {Admin_Greetings_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_empty = /** @type {((inputs?: Admin_Greetings_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_empty(inputs)
	return es_admin_greetings_empty(inputs)
});