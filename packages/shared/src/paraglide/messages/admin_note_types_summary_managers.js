/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Summary_ManagersInputs */

const en_admin_note_types_summary_managers = /** @type {(inputs: Admin_Note_Types_Summary_ManagersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`managers`)
};

const es_admin_note_types_summary_managers = /** @type {(inputs: Admin_Note_Types_Summary_ManagersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`gerentes`)
};

/**
* | output |
* | --- |
* | "managers" |
*
* @param {Admin_Note_Types_Summary_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_summary_managers = /** @type {((inputs?: Admin_Note_Types_Summary_ManagersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Summary_ManagersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_summary_managers(inputs)
	return es_admin_note_types_summary_managers(inputs)
});