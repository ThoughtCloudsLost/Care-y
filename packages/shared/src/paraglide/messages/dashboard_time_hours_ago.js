/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Time_Hours_AgoInputs */

const en_dashboard_time_hours_ago = /** @type {(inputs: Dashboard_Time_Hours_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count}h ago`)
};

const es_dashboard_time_hours_ago = /** @type {(inputs: Dashboard_Time_Hours_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`hace ${i?.count}h`)
};

const en_xa2_dashboard_time_hours_ago = /** @type {(inputs: Dashboard_Time_Hours_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}h àgò ••⟧`)
};

/**
* | output |
* | --- |
* | "{count}h ago" |
*
* @param {Dashboard_Time_Hours_AgoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_hours_ago = /** @type {((inputs: Dashboard_Time_Hours_AgoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Time_Hours_AgoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_time_hours_ago(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_time_hours_ago(inputs)
	return en_dashboard_time_hours_ago(inputs)
});