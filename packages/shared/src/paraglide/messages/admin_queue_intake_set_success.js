/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_Intake_Set_SuccessInputs */

const en_admin_queue_intake_set_success = /** @type {(inputs: Admin_Queue_Intake_Set_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Intake ${i?.queue} updated`)
};

const es_admin_queue_intake_set_success = /** @type {(inputs: Admin_Queue_Intake_Set_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.queue} de recepción actualizada`)
};

const en_xa2_admin_queue_intake_set_success = /** @type {(inputs: Admin_Queue_Intake_Set_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè  •••${i?.queue} ùpdàtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Intake {queue} updated" |
*
* @param {Admin_Queue_Intake_Set_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_set_success = /** @type {((inputs: Admin_Queue_Intake_Set_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_Set_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_intake_set_success(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_intake_set_success(inputs)
	return en_admin_queue_intake_set_success(inputs)
});