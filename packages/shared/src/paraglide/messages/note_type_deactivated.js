/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_DeactivatedInputs */

const en_note_type_deactivated = /** @type {(inputs: Note_Type_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note type deactivated`)
};

const es_note_type_deactivated = /** @type {(inputs: Note_Type_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de nota desactivado`)
};

/**
* | output |
* | --- |
* | "Note type deactivated" |
*
* @param {Note_Type_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_deactivated = /** @type {((inputs?: Note_Type_DeactivatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_DeactivatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_note_type_deactivated(inputs)
	return es_note_type_deactivated(inputs)
});