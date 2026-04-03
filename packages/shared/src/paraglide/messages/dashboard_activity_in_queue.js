/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Dashboard_Activity_In_QueueInputs */

const en_dashboard_activity_in_queue = /** @type {(inputs: Dashboard_Activity_In_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`in ${i?.queue}`)
};

const es_dashboard_activity_in_queue = /** @type {(inputs: Dashboard_Activity_In_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`en ${i?.queue}`)
};

/**
* | output |
* | --- |
* | "in {queue}" |
*
* @param {Dashboard_Activity_In_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_in_queue = /** @type {((inputs: Dashboard_Activity_In_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_In_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_activity_in_queue(inputs)
	return es_dashboard_activity_in_queue(inputs)
});