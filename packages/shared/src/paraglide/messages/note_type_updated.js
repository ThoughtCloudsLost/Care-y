/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_UpdatedInputs */

const en_note_type_updated = /** @type {(inputs: Note_Type_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note type updated`)
};

const es_note_type_updated = /** @type {(inputs: Note_Type_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de nota actualizado`)
};

/**
* | output |
* | --- |
* | "Note type updated" |
*
* @param {Note_Type_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_updated = /** @type {((inputs?: Note_Type_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_note_type_updated(inputs)
	return es_note_type_updated(inputs)
});