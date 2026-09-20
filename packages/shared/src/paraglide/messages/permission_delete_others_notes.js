/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Delete_Others_NotesInputs */

const en_permission_delete_others_notes = /** @type {(inputs: Permission_Delete_Others_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete others' notes`)
};

const es_permission_delete_others_notes = /** @type {(inputs: Permission_Delete_Others_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar notas de otros`)
};

/**
* | output |
* | --- |
* | "Delete others' notes" |
*
* @param {Permission_Delete_Others_NotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_delete_others_notes = /** @type {((inputs?: Permission_Delete_Others_NotesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Delete_Others_NotesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_delete_others_notes(inputs)
	return en_permission_delete_others_notes(inputs)
});