/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Escalate_AdminInputs */

const en_admin_note_types_escalate_admin = /** @type {(inputs: Admin_Note_Types_Escalate_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin`)
};

const es_admin_note_types_escalate_admin = /** @type {(inputs: Admin_Note_Types_Escalate_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrador`)
};

/**
* | output |
* | --- |
* | "Admin" |
*
* @param {Admin_Note_Types_Escalate_AdminInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_escalate_admin = /** @type {((inputs?: Admin_Note_Types_Escalate_AdminInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Escalate_AdminInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_escalate_admin(inputs)
	return es_admin_note_types_escalate_admin(inputs)
});