/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Role_Gating_ErrorInputs */

const en_admin_note_types_role_gating_error = /** @type {(inputs: Admin_Note_Types_Role_Gating_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The create role must be equal to or higher than the view role.`)
};

const es_admin_note_types_role_gating_error = /** @type {(inputs: Admin_Note_Types_Role_Gating_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El rol para crear debe ser igual o superior al rol para ver.`)
};

/**
* | output |
* | --- |
* | "The create role must be equal to or higher than the view role." |
*
* @param {Admin_Note_Types_Role_Gating_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_role_gating_error = /** @type {((inputs?: Admin_Note_Types_Role_Gating_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Role_Gating_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_role_gating_error(inputs)
	return es_admin_note_types_role_gating_error(inputs)
});