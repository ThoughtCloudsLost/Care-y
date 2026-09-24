/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_Intake_Clear_SuccessInputs */

const en_admin_queue_intake_clear_success = /** @type {(inputs: Admin_Queue_Intake_Clear_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Intake ${i?.queue} designation removed`)
};

const es_admin_queue_intake_clear_success = /** @type {(inputs: Admin_Queue_Intake_Clear_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Designación de ${i?.queue} de recepción eliminada`)
};

const en_xa2_admin_queue_intake_clear_success = /** @type {(inputs: Admin_Queue_Intake_Clear_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè  •••${i?.queue} dèsìgnàtìòn rèmòvèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake {queue} designation removed" |
*
* @param {Admin_Queue_Intake_Clear_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_clear_success = /** @type {((inputs: Admin_Queue_Intake_Clear_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_Clear_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_clear_success(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_clear_success(inputs)
	return en_admin_queue_intake_clear_success(inputs)
});