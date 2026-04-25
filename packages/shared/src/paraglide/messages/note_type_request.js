/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_RequestInputs */

const en_note_type_request = /** @type {(inputs: Note_Type_RequestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Request`)
};

const es_note_type_request = /** @type {(inputs: Note_Type_RequestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solicitud`)
};

/**
* | output |
* | --- |
* | "Request" |
*
* @param {Note_Type_RequestInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_request = /** @type {((inputs?: Note_Type_RequestInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_RequestInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_note_type_request(inputs)
	return es_note_type_request(inputs)
});