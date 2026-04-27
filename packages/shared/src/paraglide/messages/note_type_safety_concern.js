/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_Safety_ConcernInputs */

const en_note_type_safety_concern = /** @type {(inputs: Note_Type_Safety_ConcernInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Safety Concern`)
};

const es_note_type_safety_concern = /** @type {(inputs: Note_Type_Safety_ConcernInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preocupacion de seguridad`)
};

/**
* | output |
* | --- |
* | "Safety Concern" |
*
* @param {Note_Type_Safety_ConcernInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_safety_concern = /** @type {((inputs?: Note_Type_Safety_ConcernInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_Safety_ConcernInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_note_type_safety_concern(inputs)
	return es_note_type_safety_concern(inputs)
});