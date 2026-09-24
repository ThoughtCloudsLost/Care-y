/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Min_Create_RoleInputs */

const en_admin_note_types_min_create_role = /** @type {(inputs: Admin_Note_Types_Min_Create_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Minimum role to create`)
};

const es_admin_note_types_min_create_role = /** @type {(inputs: Admin_Note_Types_Min_Create_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol mínimo para crear`)
};

const en_xa2_admin_note_types_min_create_role = /** @type {(inputs: Admin_Note_Types_Min_Create_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mìnìmùm ròlè tò crèàtè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Minimum role to create" |
*
* @param {Admin_Note_Types_Min_Create_RoleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_min_create_role = /** @type {((inputs?: Admin_Note_Types_Min_Create_RoleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Min_Create_RoleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_min_create_role(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_min_create_role(inputs)
	return en_admin_note_types_min_create_role(inputs)
});