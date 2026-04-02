/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Queues_Open_CountInputs */

const en_dashboard_queues_open_count = /** @type {(inputs: Dashboard_Queues_Open_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open`)
};

const es_dashboard_queues_open_count = /** @type {(inputs: Dashboard_Queues_Open_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} abiertos`)
};

/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Dashboard_Queues_Open_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_open_count = /** @type {((inputs: Dashboard_Queues_Open_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Queues_Open_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_queues_open_count(inputs)
	return es_dashboard_queues_open_count(inputs)
});