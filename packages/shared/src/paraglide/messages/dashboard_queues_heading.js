/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Queues_HeadingInputs */

const en_dashboard_queues_heading = /** @type {(inputs: Dashboard_Queues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues`)
};

const es_dashboard_queues_heading = /** @type {(inputs: Dashboard_Queues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Colas`)
};

/**
* | output |
* | --- |
* | "Queues" |
*
* @param {Dashboard_Queues_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_heading = /** @type {((inputs?: Dashboard_Queues_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Queues_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_queues_heading(inputs)
	return es_dashboard_queues_heading(inputs)
});