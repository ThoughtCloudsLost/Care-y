/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Escalation_LabelInputs */

const en_admin_note_types_escalation_label = /** @type {(inputs: Admin_Note_Types_Escalation_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notify`)
};

const es_admin_note_types_escalation_label = /** @type {(inputs: Admin_Note_Types_Escalation_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificar`)
};

const en_xa2_admin_note_types_escalation_label = /** @type {(inputs: Admin_Note_Types_Escalation_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtìfy ••⟧`)
};

/**
* | output |
* | --- |
* | "Notify" |
*
* @param {Admin_Note_Types_Escalation_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_escalation_label = /** @type {((inputs?: Admin_Note_Types_Escalation_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Escalation_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_escalation_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_escalation_label(inputs)
	return en_admin_note_types_escalation_label(inputs)
});