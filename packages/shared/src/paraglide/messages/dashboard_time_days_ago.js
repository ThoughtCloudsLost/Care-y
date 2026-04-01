/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Time_Days_AgoInputs */

const en_dashboard_time_days_ago = /** @type {(inputs: Dashboard_Time_Days_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count}d ago`)
};

const es_dashboard_time_days_ago = /** @type {(inputs: Dashboard_Time_Days_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`hace ${i?.count}d`)
};

/**
* | output |
* | --- |
* | "{count}d ago" |
*
* @param {Dashboard_Time_Days_AgoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_days_ago = /** @type {((inputs: Dashboard_Time_Days_AgoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Time_Days_AgoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_time_days_ago(inputs)
	return es_dashboard_time_days_ago(inputs)
});