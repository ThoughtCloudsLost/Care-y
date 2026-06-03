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

/**
* | output |
* | --- |
* | "{Queue} Assignments" |
*
* @param {Admin_User_Queue_AssignmentsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_user_queue_assignments = /** @type {((inputs: Admin_User_Queue_AssignmentsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_User_Queue_AssignmentsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_user_queue_assignments(inputs)
	return es_admin_user_queue_assignments(inputs)
});