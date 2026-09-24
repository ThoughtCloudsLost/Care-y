/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_Intake_Clear_ErrorInputs */

const en_admin_queue_intake_clear_error = /** @type {(inputs: Admin_Queue_Intake_Clear_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Could not remove intake ${i?.queue} designation`)
};

const es_admin_queue_intake_clear_error = /** @type {(inputs: Admin_Queue_Intake_Clear_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se pudo eliminar la designación de ${i?.queue} de recepción`)
};

const en_xa2_admin_queue_intake_clear_error = /** @type {(inputs: Admin_Queue_Intake_Clear_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt rèmòvè ìntàkè  ••••••••${i?.queue} dèsìgnàtìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not remove intake {queue} designation" |
*
* @param {Admin_Queue_Intake_Clear_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_clear_error = /** @type {((inputs: Admin_Queue_Intake_Clear_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_Clear_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_clear_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_clear_error(inputs)
	return en_admin_queue_intake_clear_error(inputs)
});