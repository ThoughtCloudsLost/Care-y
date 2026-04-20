/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Save_CreateInputs */

const en_admin_greetings_save_create = /** @type {(inputs: Admin_Greetings_Save_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save greeting`)
};

const es_admin_greetings_save_create = /** @type {(inputs: Admin_Greetings_Save_CreateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar saludo`)
};

/**
* | output |
* | --- |
* | "Save greeting" |
*
* @param {Admin_Greetings_Save_CreateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_save_create = /** @type {((inputs?: Admin_Greetings_Save_CreateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Save_CreateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_save_create(inputs)
	return es_admin_greetings_save_create(inputs)
});