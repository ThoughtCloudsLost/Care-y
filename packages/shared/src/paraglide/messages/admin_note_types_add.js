/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_AddInputs */

const en_admin_note_types_add = /** @type {(inputs: Admin_Note_Types_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add Note Type`)
};

const es_admin_note_types_add = /** @type {(inputs: Admin_Note_Types_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar tipo de nota`)
};

/**
* | output |
* | --- |
* | "Add Note Type" |
*
* @param {Admin_Note_Types_AddInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_add = /** @type {((inputs?: Admin_Note_Types_AddInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_AddInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_add(inputs)
	return es_admin_note_types_add(inputs)
});