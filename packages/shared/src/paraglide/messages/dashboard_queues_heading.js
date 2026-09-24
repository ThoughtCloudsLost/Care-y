/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queues: NonNullable<unknown> }} Dashboard_Queues_HeadingInputs */

const en_dashboard_queues_heading = /** @type {(inputs: Dashboard_Queues_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

const es_dashboard_queues_heading = /** @type {(inputs: Dashboard_Queues_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queues}`)
};

const en_xa2_dashboard_queues_heading = /** @type {(inputs: Dashboard_Queues_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queues}⟧`)
};

/**
* | output |
* | --- |
* | "{Queues}" |
*
* @param {Dashboard_Queues_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_heading = /** @type {((inputs: Dashboard_Queues_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Queues_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_queues_heading(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_queues_heading(inputs)
	return en_dashboard_queues_heading(inputs)
});