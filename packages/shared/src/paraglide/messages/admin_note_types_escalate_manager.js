/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Escalate_ManagerInputs */

const en_admin_note_types_escalate_manager = /** @type {(inputs: Admin_Note_Types_Escalate_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manager`)
};

const es_admin_note_types_escalate_manager = /** @type {(inputs: Admin_Note_Types_Escalate_ManagerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gerente`)
};

/**
* | output |
* | --- |
* | "Manager" |
*
* @param {Admin_Note_Types_Escalate_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_escalate_manager = /** @type {((inputs?: Admin_Note_Types_Escalate_ManagerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Escalate_ManagerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_escalate_manager(inputs)
	return es_admin_note_types_escalate_manager(inputs)
});