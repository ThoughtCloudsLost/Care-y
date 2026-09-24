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

const en_xa2_admin_note_types_group_system = /** @type {(inputs: Admin_Note_Types_Group_SystemInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Systèm Typès ••••⟧`)
};

/**
* | output |
* | --- |
* | "System Types" |
*
* @param {Admin_Note_Types_Group_SystemInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_group_system = /** @type {((inputs?: Admin_Note_Types_Group_SystemInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Group_SystemInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_group_system(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_group_system(inputs)
	return en_admin_note_types_group_system(inputs)
});