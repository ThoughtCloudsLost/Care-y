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

const en_xa2_admin_note_types_add = /** @type {(inputs: Admin_Note_Types_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd Nòtè Typè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Add Note Type" |
*
* @param {Admin_Note_Types_AddInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_add = /** @type {((inputs?: Admin_Note_Types_AddInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_AddInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_add(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_add(inputs)
	return en_admin_note_types_add(inputs)
});