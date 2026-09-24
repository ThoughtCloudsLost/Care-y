/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Queue_Urgent_OneInputs */

const en_dashboard_queue_urgent_one = /** @type {(inputs: Dashboard_Queue_Urgent_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} urgent`)
};

const es_dashboard_queue_urgent_one = /** @type {(inputs: Dashboard_Queue_Urgent_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} urgente`)
};

const en_xa2_dashboard_queue_urgent_one = /** @type {(inputs: Dashboard_Queue_Urgent_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} ùrgènt •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} urgent" |
*
* @param {Dashboard_Queue_Urgent_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_queue_urgent_one = /** @type {((inputs: Dashboard_Queue_Urgent_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Queue_Urgent_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_queue_urgent_one(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_queue_urgent_one(inputs)
	return en_dashboard_queue_urgent_one(inputs)
});