/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Admin_User_Queue_AssignmentsInputs */

const en_admin_user_queue_assignments = /** @type {(inputs: Admin_User_Queue_AssignmentsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} Assignments`)
};

const es_admin_user_queue_assignments = /** @type {(inputs: Admin_User_Queue_AssignmentsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Asignaciones de ${i?.queue}`)
};

const en_xa2_admin_user_queue_assignments = /** @type {(inputs: Admin_User_Queue_AssignmentsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} Àssìgnmènts ••••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} Assignments" |
*
* @param {Admin_User_Queue_AssignmentsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_user_queue_assignments = /** @type {((inputs: Admin_User_Queue_AssignmentsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_User_Queue_AssignmentsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_user_queue_assignments(inputs)
	if (locale === "en-XA") return en_xa2_admin_user_queue_assignments(inputs)
	return en_admin_user_queue_assignments(inputs)
});