/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_SavedInputs */

const en_admin_greetings_saved = /** @type {(inputs: Admin_Greetings_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greeting saved.`)
};

const es_admin_greetings_saved = /** @type {(inputs: Admin_Greetings_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludo guardado.`)
};

/**
* | output |
* | --- |
* | "Greeting saved." |
*
* @param {Admin_Greetings_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_saved = /** @type {((inputs?: Admin_Greetings_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_saved(inputs)
	return es_admin_greetings_saved(inputs)
});