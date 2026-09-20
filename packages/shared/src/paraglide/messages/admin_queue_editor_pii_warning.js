/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, volunteers: NonNullable<unknown>, queues: NonNullable<unknown> }} Admin_Queue_Editor_Pii_WarningInputs */

const en_admin_queue_editor_pii_warning = /** @type {(inputs: Admin_Queue_Editor_Pii_WarningInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} names appear in email notifications sent to ${i?.volunteers}. Use functional names like "General Intake" or "Evening Line" rather than names that could identify people, cases, or locations.`)
};

const es_admin_queue_editor_pii_warning = /** @type {(inputs: Admin_Queue_Editor_Pii_WarningInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los nombres de las ${i?.queues} aparecen en las notificaciones por correo enviadas a los ${i?.volunteers}. Usa nombres funcionales como "Recepción General" o "Línea Nocturna" en lugar de nombres que puedan identificar personas, casos o ubicaciones.`)
};

const en_xa2_admin_queue_editor_pii_warning = /** @type {(inputs: Admin_Queue_Editor_Pii_WarningInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} nàmès àppèàr ìn èmàìl nòtìfìcàtìòns sènt tò  ••••••••••••••${i?.volunteers}. Ùsè fùnctìònàl nàmès lìkè "Gènèràl Ìntàkè" òr "Èvènìng Lìnè" ràthèr thàn nàmès thàt còùld ìdèntìfy pèòplè, càsès, òr lòcàtìòns. •••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} names appear in email notifications sent to {volunteers}. Use functional names like \"General Intake\" or \"Evening Line\" rather than names that could i..." |
*
* @param {Admin_Queue_Editor_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_pii_warning = /** @type {((inputs: Admin_Queue_Editor_Pii_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Pii_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_editor_pii_warning(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_editor_pii_warning(inputs)
	return en_admin_queue_editor_pii_warning(inputs)
});