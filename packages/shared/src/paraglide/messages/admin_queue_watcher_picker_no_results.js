/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Watcher_Picker_No_ResultsInputs */

const en_admin_queue_watcher_picker_no_results = /** @type {(inputs: Admin_Queue_Watcher_Picker_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No matches`)
};

const es_admin_queue_watcher_picker_no_results = /** @type {(inputs: Admin_Queue_Watcher_Picker_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin coincidencias`)
};

const en_xa2_admin_queue_watcher_picker_no_results = /** @type {(inputs: Admin_Queue_Watcher_Picker_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò màtchès •••⟧`)
};

/**
* | output |
* | --- |
* | "No matches" |
*
* @param {Admin_Queue_Watcher_Picker_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watcher_picker_no_results = /** @type {((inputs?: Admin_Queue_Watcher_Picker_No_ResultsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Watcher_Picker_No_ResultsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_watcher_picker_no_results(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_watcher_picker_no_results(inputs)
	return en_admin_queue_watcher_picker_no_results(inputs)
});