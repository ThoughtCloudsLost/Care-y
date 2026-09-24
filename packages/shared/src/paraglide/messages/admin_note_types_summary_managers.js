/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ managers: NonNullable<unknown> }} Admin_Note_Types_Summary_ManagersInputs */

const en_admin_note_types_summary_managers = /** @type {(inputs: Admin_Note_Types_Summary_ManagersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.managers}`)
};

const es_admin_note_types_summary_managers = /** @type {(inputs: Admin_Note_Types_Summary_ManagersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.managers}`)
};

const en_xa2_admin_note_types_summary_managers = /** @type {(inputs: Admin_Note_Types_Summary_ManagersInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.managers}⟧`)
};

/**
* | output |
* | --- |
* | "{managers}" |
*
* @param {Admin_Note_Types_Summary_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_summary_managers = /** @type {((inputs: Admin_Note_Types_Summary_ManagersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Summary_ManagersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_summary_managers(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_summary_managers(inputs)
	return en_admin_note_types_summary_managers(inputs)
});