/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Summary_AdminsInputs */

const en_admin_note_types_summary_admins = /** @type {(inputs: Admin_Note_Types_Summary_AdminsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`admins`)
};

const es_admin_note_types_summary_admins = /** @type {(inputs: Admin_Note_Types_Summary_AdminsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`administradores`)
};

/**
* | output |
* | --- |
* | "admins" |
*
* @param {Admin_Note_Types_Summary_AdminsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_summary_admins = /** @type {((inputs?: Admin_Note_Types_Summary_AdminsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Summary_AdminsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_summary_admins(inputs)
	return es_admin_note_types_summary_admins(inputs)
});