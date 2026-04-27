/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_ResolutionInputs */

const en_note_type_resolution = /** @type {(inputs: Note_Type_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resolution`)
};

const es_note_type_resolution = /** @type {(inputs: Note_Type_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resolucion`)
};

/**
* | output |
* | --- |
* | "Resolution" |
*
* @param {Note_Type_ResolutionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_resolution = /** @type {((inputs?: Note_Type_ResolutionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_ResolutionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_note_type_resolution(inputs)
	return es_note_type_resolution(inputs)
});