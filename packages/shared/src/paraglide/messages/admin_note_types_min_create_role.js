/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Min_Create_RoleInputs */

const en_admin_note_types_min_create_role = /** @type {(inputs: Admin_Note_Types_Min_Create_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimum role to create`)
};

const es_admin_note_types_min_create_role = /** @type {(inputs: Admin_Note_Types_Min_Create_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol minimo para crear`)
};

/**
* | output |
* | --- |
* | "Minimum role to create" |
*
* @param {Admin_Note_Types_Min_Create_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_min_create_role = /** @type {((inputs?: Admin_Note_Types_Min_Create_RoleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Min_Create_RoleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_min_create_role(inputs)
	return es_admin_note_types_min_create_role(inputs)
});