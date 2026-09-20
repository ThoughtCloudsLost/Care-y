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

const en_xa2_admin_note_types_escalate_admin = /** @type {(inputs: Admin_Note_Types_Escalate_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdmìn ••⟧`)
};

/**
* | output |
* | --- |
* | "Admin" |
*
* @param {Admin_Note_Types_Escalate_AdminInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_escalate_admin = /** @type {((inputs?: Admin_Note_Types_Escalate_AdminInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Escalate_AdminInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_escalate_admin(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_escalate_admin(inputs)
	return en_admin_note_types_escalate_admin(inputs)
});