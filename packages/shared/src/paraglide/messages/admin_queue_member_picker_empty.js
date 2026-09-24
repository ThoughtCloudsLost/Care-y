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

const en_xa2_admin_queue_member_picker_empty = /** @type {(inputs: Admin_Queue_Member_Picker_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò  •${i?.volunteers} àvàìlàblè tò àdd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No {volunteers} available to add" |
*
* @param {Admin_Queue_Member_Picker_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_picker_empty = /** @type {((inputs: Admin_Queue_Member_Picker_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_Picker_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_member_picker_empty(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_member_picker_empty(inputs)
	return en_admin_queue_member_picker_empty(inputs)
});