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

const en_xa2_dashboard_time_just_now = /** @type {(inputs: Dashboard_Time_Just_NowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Jùst nòw •••⟧`)
};

/**
* | output |
* | --- |
* | "Just now" |
*
* @param {Dashboard_Time_Just_NowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_just_now = /** @type {((inputs?: Dashboard_Time_Just_NowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Time_Just_NowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_time_just_now(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_time_just_now(inputs)
	return en_dashboard_time_just_now(inputs)
});