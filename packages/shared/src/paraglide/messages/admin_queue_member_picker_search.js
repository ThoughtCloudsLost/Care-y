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

/**
* | output |
* | --- |
* | "Search {volunteers}" |
*
* @param {Admin_Queue_Member_Picker_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_picker_search = /** @type {((inputs: Admin_Queue_Member_Picker_SearchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_Picker_SearchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_member_picker_search(inputs)
	return es_admin_queue_member_picker_search(inputs)
});