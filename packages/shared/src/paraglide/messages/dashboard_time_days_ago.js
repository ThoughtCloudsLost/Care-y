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

const en_xa2_dashboard_time_days_ago = /** @type {(inputs: Dashboard_Time_Days_AgoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}d àgò ••⟧`)
};

/**
* | output |
* | --- |
* | "{count}d ago" |
*
* @param {Dashboard_Time_Days_AgoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_days_ago = /** @type {((inputs: Dashboard_Time_Days_AgoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Time_Days_AgoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_time_days_ago(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_time_days_ago(inputs)
	return en_dashboard_time_days_ago(inputs)
});