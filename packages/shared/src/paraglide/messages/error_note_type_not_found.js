/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Note_Type_Not_FoundInputs */

const en_error_note_type_not_found = /** @type {(inputs: Error_Note_Type_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note type not found.`)
};

const es_error_note_type_not_found = /** @type {(inputs: Error_Note_Type_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de nota no encontrado.`)
};

/**
* | output |
* | --- |
* | "Note type not found." |
*
* @param {Error_Note_Type_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_note_type_not_found = /** @type {((inputs?: Error_Note_Type_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Note_Type_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_note_type_not_found(inputs)
	return es_error_note_type_not_found(inputs)
});