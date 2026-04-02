/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Info_No_ActivityInputs */

const en_dashboard_info_no_activity = /** @type {(inputs: Dashboard_Info_No_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No recent activity`)
};

const es_dashboard_info_no_activity = /** @type {(inputs: Dashboard_Info_No_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin actividad reciente`)
};

/**
* | output |
* | --- |
* | "No recent activity" |
*
* @param {Dashboard_Info_No_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_no_activity = /** @type {((inputs?: Dashboard_Info_No_ActivityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_No_ActivityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_no_activity(inputs)
	return es_dashboard_info_no_activity(inputs)
});