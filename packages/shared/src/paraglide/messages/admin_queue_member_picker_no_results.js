/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Member_Picker_No_ResultsInputs */

const en_admin_queue_member_picker_no_results = /** @type {(inputs: Admin_Queue_Member_Picker_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No matches`)
};

const es_admin_queue_member_picker_no_results = /** @type {(inputs: Admin_Queue_Member_Picker_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin resultados`)
};

/**
* | output |
* | --- |
* | "No matches" |
*
* @param {Admin_Queue_Member_Picker_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_member_picker_no_results = /** @type {((inputs?: Admin_Queue_Member_Picker_No_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Member_Picker_No_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_member_picker_no_results(inputs)
	return es_admin_queue_member_picker_no_results(inputs)
});