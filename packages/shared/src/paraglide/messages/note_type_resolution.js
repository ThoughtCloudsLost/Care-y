/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_ResolutionInputs */

const en_note_type_resolution = /** @type {(inputs: Note_Type_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resolution`)
};

const es_note_type_resolution = /** @type {(inputs: Note_Type_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resolución`)
};

const en_xa2_note_type_resolution = /** @type {(inputs: Note_Type_ResolutionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsòlùtìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Resolution" |
*
* @param {Note_Type_ResolutionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_resolution = /** @type {((inputs?: Note_Type_ResolutionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_ResolutionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_note_type_resolution(inputs)
	if (locale === "en-XA") return en_xa2_note_type_resolution(inputs)
	return en_note_type_resolution(inputs)
});