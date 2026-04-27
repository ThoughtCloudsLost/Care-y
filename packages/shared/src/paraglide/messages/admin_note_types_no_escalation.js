/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_No_EscalationInputs */

const en_admin_note_types_no_escalation = /** @type {(inputs: Admin_Note_Types_No_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No notifications`)
};

const es_admin_note_types_no_escalation = /** @type {(inputs: Admin_Note_Types_No_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin notificaciones`)
};

/**
* | output |
* | --- |
* | "No notifications" |
*
* @param {Admin_Note_Types_No_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_no_escalation = /** @type {((inputs?: Admin_Note_Types_No_EscalationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_No_EscalationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_no_escalation(inputs)
	return es_admin_note_types_no_escalation(inputs)
});