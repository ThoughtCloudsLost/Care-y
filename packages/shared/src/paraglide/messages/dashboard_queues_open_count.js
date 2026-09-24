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

const en_xa2_dashboard_queues_open_count = /** @type {(inputs: Dashboard_Queues_Open_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òpèn ••⟧`)
};

/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Dashboard_Queues_Open_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_open_count = /** @type {((inputs: Dashboard_Queues_Open_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Queues_Open_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_queues_open_count(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_queues_open_count(inputs)
	return en_dashboard_queues_open_count(inputs)
});