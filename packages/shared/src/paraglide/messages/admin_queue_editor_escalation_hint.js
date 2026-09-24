/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Admin_Queue_Editor_Escalation_HintInputs */

const en_admin_queue_editor_escalation_hint = /** @type {(inputs: Admin_Queue_Editor_Escalation_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Days before a ${i?.ticket} auto-escalates. Leave empty to disable.`)
};

const es_admin_queue_editor_escalation_hint = /** @type {(inputs: Admin_Queue_Editor_Escalation_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Días antes de que un ${i?.ticket} se escale automáticamente. Dejar vacio para desactivar.`)
};

const en_xa2_admin_queue_editor_escalation_hint = /** @type {(inputs: Admin_Queue_Editor_Escalation_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dàys bèfòrè à  •••••${i?.ticket} àùtò-èscàlàtès. Lèàvè èmpty tò dìsàblè. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Days before a {ticket} auto-escalates. Leave empty to disable." |
*
* @param {Admin_Queue_Editor_Escalation_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_escalation_hint = /** @type {((inputs: Admin_Queue_Editor_Escalation_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Escalation_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_escalation_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_escalation_hint(inputs)
	return en_admin_queue_editor_escalation_hint(inputs)
});