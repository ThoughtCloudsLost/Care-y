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

const en_xa2_note_type_request = /** @type {(inputs: Note_Type_RequestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèqùèst •••⟧`)
};

/**
* | output |
* | --- |
* | "Request" |
*
* @param {Note_Type_RequestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_request = /** @type {((inputs?: Note_Type_RequestInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_RequestInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_note_type_request(inputs)
	if (locale === "en-XA") return en_xa2_note_type_request(inputs)
	return en_note_type_request(inputs)
});