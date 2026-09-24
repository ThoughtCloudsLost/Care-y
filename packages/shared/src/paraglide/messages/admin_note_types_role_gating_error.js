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

const en_xa2_admin_note_types_role_gating_error = /** @type {(inputs: Admin_Note_Types_Role_Gating_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè crèàtè ròlè mùst bè èqùàl tò òr hìghèr thàn thè vìèw ròlè. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The create role must be equal to or higher than the view role." |
*
* @param {Admin_Note_Types_Role_Gating_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_role_gating_error = /** @type {((inputs?: Admin_Note_Types_Role_Gating_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Role_Gating_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_role_gating_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_role_gating_error(inputs)
	return en_admin_note_types_role_gating_error(inputs)
});