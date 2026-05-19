/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ min: NonNullable<unknown> }} Admin_Queue_Editor_Escalation_RangeInputs */

const en_admin_queue_editor_escalation_range = /** @type {(inputs: Admin_Queue_Editor_Escalation_RangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Escalation days must be between ${i?.min} and 365.`)
};

const es_admin_queue_editor_escalation_range = /** @type {(inputs: Admin_Queue_Editor_Escalation_RangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los dias de escalacion deben estar entre ${i?.min} y 365.`)
};

/**
* | output |
* | --- |
* | "Escalation days must be between {min} and 365." |
*
* @param {Admin_Queue_Editor_Escalation_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_escalation_range = /** @type {((inputs: Admin_Queue_Editor_Escalation_RangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Escalation_RangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_escalation_range(inputs)
	return es_admin_queue_editor_escalation_range(inputs)
});