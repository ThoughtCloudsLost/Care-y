/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Admin_Queue_Member_Picker_SearchInputs */

const en_admin_queue_member_picker_search = /** @type {(inputs: Admin_Queue_Member_Picker_SearchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search ${i?.volunteers}`)
};

const es_admin_queue_member_picker_search = /** @type {(inputs: Admin_Queue_Member_Picker_SearchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscar ${i?.volunteers}`)
};

const en_xa2_admin_queue_member_picker_search = /** @type {(inputs: Admin_Queue_Member_Picker_SearchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch  •••${i?.volunteers}⟧`)
};

/**
* | output |
* | --- |
* | "Search {volunteers}" |
*
* @param {Admin_Queue_Member_Picker_SearchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_picker_search = /** @type {((inputs: Admin_Queue_Member_Picker_SearchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_Picker_SearchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_member_picker_search(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_member_picker_search(inputs)
	return en_admin_queue_member_picker_search(inputs)
});