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

const en_xa2_register_note = /** @type {(inputs: Register_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè ••⟧`)
};

/**
* | output |
* | --- |
* | "Note" |
*
* @param {Register_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const register_note = /** @type {((inputs?: Register_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Register_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_register_note(inputs)
	if (locale === "en-XA") return en_xa2_register_note(inputs)
	return en_register_note(inputs)
});