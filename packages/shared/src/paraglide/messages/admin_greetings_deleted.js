/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_DeletedInputs */

const en_admin_greetings_deleted = /** @type {(inputs: Admin_Greetings_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greeting deleted.`)
};

const es_admin_greetings_deleted = /** @type {(inputs: Admin_Greetings_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludo eliminado.`)
};

/**
* | output |
* | --- |
* | "Greeting deleted." |
*
* @param {Admin_Greetings_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_deleted = /** @type {((inputs?: Admin_Greetings_DeletedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_DeletedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_deleted(inputs)
	return es_admin_greetings_deleted(inputs)
});