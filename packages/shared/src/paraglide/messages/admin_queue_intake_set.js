/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Admin_Queue_Intake_SetInputs */

const en_admin_queue_intake_set = /** @type {(inputs: Admin_Queue_Intake_SetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Use as intake ${i?.queue}`)
};

const es_admin_queue_intake_set = /** @type {(inputs: Admin_Queue_Intake_SetInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Usar como ${i?.queue} de recepcion`)
};

/**
* | output |
* | --- |
* | "Use as intake {queue}" |
*
* @param {Admin_Queue_Intake_SetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_intake_set = /** @type {((inputs: Admin_Queue_Intake_SetInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Intake_SetInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_intake_set(inputs)
	return es_admin_queue_intake_set(inputs)
});