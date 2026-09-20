/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_Intake_SetInputs */

const en_admin_queue_intake_set = /** @type {(inputs: Admin_Queue_Intake_SetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Use as intake ${i?.queue}`)
};

const es_admin_queue_intake_set = /** @type {(inputs: Admin_Queue_Intake_SetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Usar como ${i?.queue} de recepción`)
};

const en_xa2_admin_queue_intake_set = /** @type {(inputs: Admin_Queue_Intake_SetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ùsè às ìntàkè  •••••${i?.queue}⟧`)
};

/**
* | output |
* | --- |
* | "Use as intake {queue}" |
*
* @param {Admin_Queue_Intake_SetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_set = /** @type {((inputs: Admin_Queue_Intake_SetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_SetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_set(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_set(inputs)
	return en_admin_queue_intake_set(inputs)
});