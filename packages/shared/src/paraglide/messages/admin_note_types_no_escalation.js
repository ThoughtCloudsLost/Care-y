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

const en_xa2_admin_note_types_no_escalation = /** @type {(inputs: Admin_Note_Types_No_EscalationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò nòtìfìcàtìòns •••••⟧`)
};

/**
* | output |
* | --- |
* | "No notifications" |
*
* @param {Admin_Note_Types_No_EscalationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_no_escalation = /** @type {((inputs?: Admin_Note_Types_No_EscalationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_No_EscalationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_no_escalation(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_no_escalation(inputs)
	return en_admin_note_types_no_escalation(inputs)
});