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

/**
* | output |
* | --- |
* | "Note type" |
*
* @param {Note_Compose_Type_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_compose_type_label = /** @type {((inputs?: Note_Compose_Type_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Note_Compose_Type_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_note_compose_type_label(inputs)
	return es_note_compose_type_label(inputs)
});