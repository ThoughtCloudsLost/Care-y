/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Description_PlaceholderInputs */

const en_admin_note_types_description_placeholder = /** @type {(inputs: Admin_Note_Types_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What is this note type used for?`)
};

const es_admin_note_types_description_placeholder = /** @type {(inputs: Admin_Note_Types_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Para que se usa este tipo de nota?`)
};

/**
* | output |
* | --- |
* | "What is this note type used for?" |
*
* @param {Admin_Note_Types_Description_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_description_placeholder = /** @type {((inputs?: Admin_Note_Types_Description_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Description_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_description_placeholder(inputs)
	return es_admin_note_types_description_placeholder(inputs)
});