/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Group_SystemInputs */

const en_admin_note_types_group_system = /** @type {(inputs: Admin_Note_Types_Group_SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`System Types`)
};

const es_admin_note_types_group_system = /** @type {(inputs: Admin_Note_Types_Group_SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipos del sistema`)
};

/**
* | output |
* | --- |
* | "System Types" |
*
* @param {Admin_Note_Types_Group_SystemInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_group_system = /** @type {((inputs?: Admin_Note_Types_Group_SystemInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Group_SystemInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_group_system(inputs)
	return es_admin_note_types_group_system(inputs)
});