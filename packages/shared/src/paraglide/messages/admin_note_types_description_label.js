/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Description_LabelInputs */

const en_admin_note_types_description_label = /** @type {(inputs: Admin_Note_Types_Description_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Description`)
};

const es_admin_note_types_description_label = /** @type {(inputs: Admin_Note_Types_Description_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descripción`)
};

const en_xa2_admin_note_types_description_label = /** @type {(inputs: Admin_Note_Types_Description_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèscrìptìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Description" |
*
* @param {Admin_Note_Types_Description_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_description_label = /** @type {((inputs?: Admin_Note_Types_Description_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Description_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_description_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_description_label(inputs)
	return en_admin_note_types_description_label(inputs)
});