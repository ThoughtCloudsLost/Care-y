/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Register_NoteInputs */

const en_register_note = /** @type {(inputs: Register_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note`)
};

const es_register_note = /** @type {(inputs: Register_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nota`)
};

/**
* | output |
* | --- |
* | "Note" |
*
* @param {Register_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const register_note = /** @type {((inputs?: Register_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_register_note(inputs)
	return es_register_note(inputs)
});