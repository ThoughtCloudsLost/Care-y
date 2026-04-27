/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Group_ConfigurableInputs */

const en_admin_note_types_group_configurable = /** @type {(inputs: Admin_Note_Types_Group_ConfigurableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal Note Types`)
};

const es_admin_note_types_group_configurable = /** @type {(inputs: Admin_Note_Types_Group_ConfigurableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipos de notas internas`)
};

/**
* | output |
* | --- |
* | "Internal Note Types" |
*
* @param {Admin_Note_Types_Group_ConfigurableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_group_configurable = /** @type {((inputs?: Admin_Note_Types_Group_ConfigurableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Group_ConfigurableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_group_configurable(inputs)
	return es_admin_note_types_group_configurable(inputs)
});