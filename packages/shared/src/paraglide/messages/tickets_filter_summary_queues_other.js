/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, queues: NonNullable<unknown> }} Tickets_Filter_Summary_Queues_OtherInputs */

const en_tickets_filter_summary_queues_other = /** @type {(inputs: Tickets_Filter_Summary_Queues_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queues}`)
};

const es_tickets_filter_summary_queues_other = /** @type {(inputs: Tickets_Filter_Summary_Queues_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.queues}`)
};

const en_xa2_tickets_filter_summary_queues_other = /** @type {(inputs: Tickets_Filter_Summary_Queues_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}  •${i?.queues}⟧`)
};

/**
* | output |
* | --- |
* | "{count} {queues}" |
*
* @param {Tickets_Filter_Summary_Queues_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_summary_queues_other = /** @type {((inputs: Tickets_Filter_Summary_Queues_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Summary_Queues_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_summary_queues_other(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_summary_queues_other(inputs)
	return en_tickets_filter_summary_queues_other(inputs)
});