/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_CommentInputs */

const en_note_type_comment = /** @type {(inputs: Note_Type_CommentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comment`)
};

const es_note_type_comment = /** @type {(inputs: Note_Type_CommentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comentario`)
};

/**
* | output |
* | --- |
* | "Comment" |
*
* @param {Note_Type_CommentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_comment = /** @type {((inputs?: Note_Type_CommentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_CommentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_note_type_comment(inputs)
	return es_note_type_comment(inputs)
});