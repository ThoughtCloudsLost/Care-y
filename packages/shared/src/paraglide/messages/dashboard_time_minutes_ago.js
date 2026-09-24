/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Time_Minutes_AgoInputs */

const en_dashboard_time_minutes_ago = /** @type {(inputs: Dashboard_Time_Minutes_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count}m ago`)
};

const es_dashboard_time_minutes_ago = /** @type {(inputs: Dashboard_Time_Minutes_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`hace ${i?.count}m`)
};

const en_xa2_dashboard_time_minutes_ago = /** @type {(inputs: Dashboard_Time_Minutes_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}m àgò ••⟧`)
};

/**
* | output |
* | --- |
* | "{count}m ago" |
*
* @param {Dashboard_Time_Minutes_AgoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_minutes_ago = /** @type {((inputs: Dashboard_Time_Minutes_AgoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Time_Minutes_AgoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_time_minutes_ago(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_time_minutes_ago(inputs)
	return en_dashboard_time_minutes_ago(inputs)
});