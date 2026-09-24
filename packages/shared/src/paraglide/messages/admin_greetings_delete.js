/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_DeleteInputs */

const en_admin_greetings_delete = /** @type {(inputs: Admin_Greetings_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete`)
};

const es_admin_greetings_delete = /** @type {(inputs: Admin_Greetings_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

const en_xa2_admin_greetings_delete = /** @type {(inputs: Admin_Greetings_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè ••⟧`)
};

/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Admin_Greetings_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_delete = /** @type {((inputs?: Admin_Greetings_DeleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_DeleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_delete(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_delete(inputs)
	return en_admin_greetings_delete(inputs)
});