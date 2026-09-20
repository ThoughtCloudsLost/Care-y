/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queueName: NonNullable<unknown> }} Dashboard_Activity_In_QueueInputs */

const en_dashboard_activity_in_queue = /** @type {(inputs: Dashboard_Activity_In_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`in ${i?.queueName}`)
};

const es_dashboard_activity_in_queue = /** @type {(inputs: Dashboard_Activity_In_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`en ${i?.queueName}`)
};

const en_xa2_dashboard_activity_in_queue = /** @type {(inputs: Dashboard_Activity_In_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦ìn  •${i?.queueName}⟧`)
};

/**
* | output |
* | --- |
* | "in {queueName}" |
*
* @param {Dashboard_Activity_In_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_in_queue = /** @type {((inputs: Dashboard_Activity_In_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_In_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_in_queue(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_in_queue(inputs)
	return en_dashboard_activity_in_queue(inputs)
});