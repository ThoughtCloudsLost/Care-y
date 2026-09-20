/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queues: NonNullable<unknown> }} Admin_Queue_Editor_No_Org_KeyInputs */

const en_admin_queue_editor_no_org_key = /** @type {(inputs: Admin_Queue_Editor_No_Org_KeyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Organization key not loaded. Cannot create or edit ${i?.queues}.`)
};

const es_admin_queue_editor_no_org_key = /** @type {(inputs: Admin_Queue_Editor_No_Org_KeyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Clave de la organización no cargada. No se pueden crear ni editar ${i?.queues}.`)
};

const en_xa2_admin_queue_editor_no_org_key = /** @type {(inputs: Admin_Queue_Editor_No_Org_KeyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn kèy nòt lòàdèd. Cànnòt crèàtè òr èdìt  ••••••••••••••••${i?.queues}. •⟧`)
};

/**
* | output |
* | --- |
* | "Organization key not loaded. Cannot create or edit {queues}." |
*
* @param {Admin_Queue_Editor_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_no_org_key = /** @type {((inputs: Admin_Queue_Editor_No_Org_KeyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_No_Org_KeyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_no_org_key(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_no_org_key(inputs)
	return en_admin_queue_editor_no_org_key(inputs)
});