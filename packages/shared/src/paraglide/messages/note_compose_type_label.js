/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Note_Compose_Type_LabelInputs */

const en_note_compose_type_label = /** @type {(inputs: Note_Compose_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note type`)
};

const es_note_compose_type_label = /** @type {(inputs: Note_Compose_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo de nota`)
};

const en_xa2_note_compose_type_label = /** @type {(inputs: Note_Compose_Type_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè typè •••⟧`)
};

/**
* | output |
* | --- |
* | "Note type" |
*
* @param {Note_Compose_Type_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_compose_type_label = /** @type {((inputs?: Note_Compose_Type_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Compose_Type_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_note_compose_type_label(inputs)
	if (locale === "en-XA") return en_xa2_note_compose_type_label(inputs)
	return en_note_compose_type_label(inputs)
});