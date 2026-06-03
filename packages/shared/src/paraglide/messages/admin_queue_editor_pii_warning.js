/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, volunteers: NonNullable<unknown>, queues: NonNullable<unknown> }} Admin_Queue_Editor_Pii_WarningInputs */

const en_admin_queue_editor_pii_warning = /** @type {(inputs: Admin_Queue_Editor_Pii_WarningInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} names appear in email notifications sent to ${i?.volunteers}. Use functional names like "General Intake" or "Evening Line" rather than names that could identify people, cases, or locations.`)
};

const es_admin_queue_editor_pii_warning = /** @type {(inputs: Admin_Queue_Editor_Pii_WarningInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los nombres de las ${i?.queues} aparecen en las notificaciones por correo enviadas a los ${i?.volunteers}. Usa nombres funcionales como "Recepcion General" o "Linea Nocturna" en lugar de nombres que puedan identificar personas, casos o ubicaciones.`)
};

/**
* | output |
* | --- |
* | "{Queue} names appear in email notifications sent to {volunteers}. Use functional names like \"General Intake\" or \"Evening Line\" rather than names that could i..." |
*
* @param {Admin_Queue_Editor_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_pii_warning = /** @type {((inputs: Admin_Queue_Editor_Pii_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Editor_Pii_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_editor_pii_warning(inputs)
	return es_admin_queue_editor_pii_warning(inputs)
});