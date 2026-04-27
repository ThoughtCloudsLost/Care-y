/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_EditInputs */

const en_admin_note_types_edit = /** @type {(inputs: Admin_Note_Types_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Note Type`)
};

const es_admin_note_types_edit = /** @type {(inputs: Admin_Note_Types_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar tipo de nota`)
};

/**
* | output |
* | --- |
* | "Edit Note Type" |
*
* @param {Admin_Note_Types_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_edit = /** @type {((inputs?: Admin_Note_Types_EditInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_EditInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_edit(inputs)
	return es_admin_note_types_edit(inputs)
});