/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown> }} Followup_Type_Merge_NoteInputs */

const en_followup_type_merge_note = /** @type {(inputs: Followup_Type_Merge_NoteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Combined ${i?.Tickets}`)
};

const es_followup_type_merge_note = /** @type {(inputs: Followup_Type_Merge_NoteInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets} combinados`)
};

/**
* | output |
* | --- |
* | "Combined {Tickets}" |
*
* @param {Followup_Type_Merge_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_merge_note = /** @type {((inputs: Followup_Type_Merge_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Merge_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_merge_note(inputs)
	return es_followup_type_merge_note(inputs)
});