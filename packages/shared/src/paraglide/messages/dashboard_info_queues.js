/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Info_QueuesInputs */

const en_dashboard_info_queues = /** @type {(inputs: Dashboard_Info_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues`)
};

const es_dashboard_info_queues = /** @type {(inputs: Dashboard_Info_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Colas`)
};

/**
* | output |
* | --- |
* | "Queues" |
*
* @param {Dashboard_Info_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_queues = /** @type {((inputs?: Dashboard_Info_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_queues(inputs)
	return es_dashboard_info_queues(inputs)
});