/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ min: NonNullable<unknown> }} Admin_Queue_Editor_Escalation_RangeInputs */

const en_admin_queue_editor_escalation_range = /** @type {(inputs: Admin_Queue_Editor_Escalation_RangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Escalation days must be between ${i?.min} and 365.`)
};

const es_admin_queue_editor_escalation_range = /** @type {(inputs: Admin_Queue_Editor_Escalation_RangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los días de escalación deben estar entre ${i?.min} y 365.`)
};

const en_xa2_admin_queue_editor_escalation_range = /** @type {(inputs: Admin_Queue_Editor_Escalation_RangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Èscàlàtìòn dàys mùst bè bètwèèn  ••••••••••${i?.min} ànd 365. •••⟧`)
};

/**
* | output |
* | --- |
* | "Escalation days must be between {min} and 365." |
*
* @param {Admin_Queue_Editor_Escalation_RangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_escalation_range = /** @type {((inputs: Admin_Queue_Editor_Escalation_RangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Escalation_RangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_escalation_range(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_escalation_range(inputs)
	return en_admin_queue_editor_escalation_range(inputs)
});