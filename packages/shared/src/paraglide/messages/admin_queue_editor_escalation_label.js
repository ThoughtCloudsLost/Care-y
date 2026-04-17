/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Editor_Escalation_LabelInputs */

const en_admin_queue_editor_escalation_label = /** @type {(inputs: Admin_Queue_Editor_Escalation_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalation Days`)
};

const es_admin_queue_editor_escalation_label = /** @type {(inputs: Admin_Queue_Editor_Escalation_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dias de escalacion`)
};

/**
* | output |
* | --- |
* | "Escalation Days" |
*
* @param {Admin_Queue_Editor_Escalation_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_escalation_label = /** @type {((inputs?: Admin_Queue_Editor_Escalation_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Escalation_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_escalation_label(inputs)
	return es_admin_queue_editor_escalation_label(inputs)
});