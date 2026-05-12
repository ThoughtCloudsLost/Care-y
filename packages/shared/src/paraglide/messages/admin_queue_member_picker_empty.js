/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Admin_Queue_Member_Picker_EmptyInputs */

const en_admin_queue_member_picker_empty = /** @type {(inputs: Admin_Queue_Member_Picker_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No ${i?.volunteers} available to add`)
};

const es_admin_queue_member_picker_empty = /** @type {(inputs: Admin_Queue_Member_Picker_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay ${i?.volunteers} disponibles para agregar`)
};

/**
* | output |
* | --- |
* | "No {volunteers} available to add" |
*
* @param {Admin_Queue_Member_Picker_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_picker_empty = /** @type {((inputs: Admin_Queue_Member_Picker_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_Picker_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_member_picker_empty(inputs)
	return es_admin_queue_member_picker_empty(inputs)
});