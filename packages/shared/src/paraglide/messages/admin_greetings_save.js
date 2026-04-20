/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_SaveInputs */

const en_admin_greetings_save = /** @type {(inputs: Admin_Greetings_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save`)
};

const es_admin_greetings_save = /** @type {(inputs: Admin_Greetings_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar`)
};

/**
* | output |
* | --- |
* | "Save" |
*
* @param {Admin_Greetings_SaveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_save = /** @type {((inputs?: Admin_Greetings_SaveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_SaveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_save(inputs)
	return es_admin_greetings_save(inputs)
});