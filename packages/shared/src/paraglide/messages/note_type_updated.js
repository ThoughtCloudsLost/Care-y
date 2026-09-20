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

const en_xa2_note_type_updated = /** @type {(inputs: Note_Type_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè typè ùpdàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Note type updated" |
*
* @param {Note_Type_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_updated = /** @type {((inputs?: Note_Type_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_note_type_updated(inputs)
	if (locale === "en-XA") return en_xa2_note_type_updated(inputs)
	return en_note_type_updated(inputs)
});