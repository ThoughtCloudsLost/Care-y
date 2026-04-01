/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Time_Just_NowInputs */

const en_dashboard_time_just_now = /** @type {(inputs: Dashboard_Time_Just_NowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Just now`)
};

const es_dashboard_time_just_now = /** @type {(inputs: Dashboard_Time_Just_NowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ahora`)
};

/**
* | output |
* | --- |
* | "Just now" |
*
* @param {Dashboard_Time_Just_NowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_just_now = /** @type {((inputs?: Dashboard_Time_Just_NowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Time_Just_NowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_time_just_now(inputs)
	return es_dashboard_time_just_now(inputs)
});