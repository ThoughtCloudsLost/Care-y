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

const en_xa2_note_type_deactivated = /** @type {(inputs: Note_Type_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè typè dèàctìvàtèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Note type deactivated" |
*
* @param {Note_Type_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_deactivated = /** @type {((inputs?: Note_Type_DeactivatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_DeactivatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_note_type_deactivated(inputs)
	if (locale === "en-XA") return en_xa2_note_type_deactivated(inputs)
	return en_note_type_deactivated(inputs)
});