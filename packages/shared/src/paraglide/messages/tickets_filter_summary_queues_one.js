/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, queue: NonNullable<unknown> }} Tickets_Filter_Summary_Queues_OneInputs */

const en_tickets_filter_summary_queues_one = /** @type {(inputs: Tickets_Filter_Summary_Queues_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queue}`)
};

const es_tickets_filter_summary_queues_one = /** @type {(inputs: Tickets_Filter_Summary_Queues_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queue}`)
};

const en_xa2_tickets_filter_summary_queues_one = /** @type {(inputs: Tickets_Filter_Summary_Queues_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}  •${i?.queue}⟧`)
};

/**
* | output |
* | --- |
* | "{count} {queue}" |
*
* @param {Tickets_Filter_Summary_Queues_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_summary_queues_one = /** @type {((inputs: Tickets_Filter_Summary_Queues_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Summary_Queues_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_summary_queues_one(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_summary_queues_one(inputs)
	return en_tickets_filter_summary_queues_one(inputs)
});