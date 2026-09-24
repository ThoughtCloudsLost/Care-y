/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Manager: NonNullable<unknown> }} Admin_Note_Types_Escalate_ManagerInputs */

const en_admin_note_types_escalate_manager = /** @type {(inputs: Admin_Note_Types_Escalate_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

const es_admin_note_types_escalate_manager = /** @type {(inputs: Admin_Note_Types_Escalate_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

const en_xa2_admin_note_types_escalate_manager = /** @type {(inputs: Admin_Note_Types_Escalate_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Manager}⟧`)
};

/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Admin_Note_Types_Escalate_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_escalate_manager = /** @type {((inputs: Admin_Note_Types_Escalate_ManagerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Escalate_ManagerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_escalate_manager(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_escalate_manager(inputs)
	return en_admin_note_types_escalate_manager(inputs)
});