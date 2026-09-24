/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_CreatedInputs */

const en_note_type_created = /** @type {(inputs: Note_Type_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note type created`)
};

const es_note_type_created = /** @type {(inputs: Note_Type_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de nota creado`)
};

const en_xa2_note_type_created = /** @type {(inputs: Note_Type_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè typè crèàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Note type created" |
*
* @param {Note_Type_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_created = /** @type {((inputs?: Note_Type_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_note_type_created(inputs)
	if (locale === "en-XA") return en_xa2_note_type_created(inputs)
	return en_note_type_created(inputs)
});