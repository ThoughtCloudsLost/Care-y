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

const en_xa2_followup_type_merge_note_desc = /** @type {(inputs: Followup_Type_Merge_Note_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrds òf còmbìnèd càllèr pròfìlès •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Records of combined caller profiles" |
*
* @param {Followup_Type_Merge_Note_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_merge_note_desc = /** @type {((inputs?: Followup_Type_Merge_Note_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Merge_Note_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_merge_note_desc(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_merge_note_desc(inputs)
	return en_followup_type_merge_note_desc(inputs)
});