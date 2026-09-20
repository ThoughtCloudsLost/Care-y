/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Type_Safety_ConcernInputs */

const en_note_type_safety_concern = /** @type {(inputs: Note_Type_Safety_ConcernInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Safety Concern`)
};

const es_note_type_safety_concern = /** @type {(inputs: Note_Type_Safety_ConcernInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preocupación de seguridad`)
};

const en_xa2_note_type_safety_concern = /** @type {(inputs: Note_Type_Safety_ConcernInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàfèty Còncèrn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Safety Concern" |
*
* @param {Note_Type_Safety_ConcernInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_safety_concern = /** @type {((inputs?: Note_Type_Safety_ConcernInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Type_Safety_ConcernInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_note_type_safety_concern(inputs)
	if (locale === "en-XA") return en_xa2_note_type_safety_concern(inputs)
	return en_note_type_safety_concern(inputs)
});