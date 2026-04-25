/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Merge_Note_DescInputs */

const en_followup_type_merge_note_desc = /** @type {(inputs: Followup_Type_Merge_Note_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Records of combined caller profiles`)
};

const es_followup_type_merge_note_desc = /** @type {(inputs: Followup_Type_Merge_Note_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registros de perfiles de personas combinados`)
};

/**
* | output |
* | --- |
* | "Records of combined caller profiles" |
*
* @param {Followup_Type_Merge_Note_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_merge_note_desc = /** @type {((inputs?: Followup_Type_Merge_Note_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Merge_Note_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_merge_note_desc(inputs)
	return es_followup_type_merge_note_desc(inputs)
});