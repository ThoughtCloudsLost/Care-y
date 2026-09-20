/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_Intake_Set_ErrorInputs */

const en_admin_queue_intake_set_error = /** @type {(inputs: Admin_Queue_Intake_Set_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Could not update intake ${i?.queue}`)
};

const es_admin_queue_intake_set_error = /** @type {(inputs: Admin_Queue_Intake_Set_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se pudo actualizar la ${i?.queue} de recepción`)
};

const en_xa2_admin_queue_intake_set_error = /** @type {(inputs: Admin_Queue_Intake_Set_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùpdàtè ìntàkè  ••••••••${i?.queue}⟧`)
};

/**
* | output |
* | --- |
* | "Could not update intake {queue}" |
*
* @param {Admin_Queue_Intake_Set_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_set_error = /** @type {((inputs: Admin_Queue_Intake_Set_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_Set_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_set_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_set_error(inputs)
	return en_admin_queue_intake_set_error(inputs)
});