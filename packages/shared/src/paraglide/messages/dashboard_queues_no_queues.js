/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queues: NonNullable<unknown> }} Dashboard_Queues_No_QueuesInputs */

const en_dashboard_queues_no_queues = /** @type {(inputs: Dashboard_Queues_No_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No ${i?.queues} assigned`)
};

const es_dashboard_queues_no_queues = /** @type {(inputs: Dashboard_Queues_No_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sin ${i?.queues} asignadas`)
};

/**
* | output |
* | --- |
* | "No {queues} assigned" |
*
* @param {Dashboard_Queues_No_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_no_queues = /** @type {((inputs: Dashboard_Queues_No_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Queues_No_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_queues_no_queues(inputs)
	return es_dashboard_queues_no_queues(inputs)
});