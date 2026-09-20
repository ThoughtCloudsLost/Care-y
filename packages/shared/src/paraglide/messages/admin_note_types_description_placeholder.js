/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Description_PlaceholderInputs */

const en_admin_note_types_description_placeholder = /** @type {(inputs: Admin_Note_Types_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What is this note type used for?`)
};

const es_admin_note_types_description_placeholder = /** @type {(inputs: Admin_Note_Types_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Para qué se usa este tipo de nota?`)
};

const en_xa2_admin_note_types_description_placeholder = /** @type {(inputs: Admin_Note_Types_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt ìs thìs nòtè typè ùsèd fòr? ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "What is this note type used for?" |
*
* @param {Admin_Note_Types_Description_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_description_placeholder = /** @type {((inputs?: Admin_Note_Types_Description_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Description_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_description_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_description_placeholder(inputs)
	return en_admin_note_types_description_placeholder(inputs)
});