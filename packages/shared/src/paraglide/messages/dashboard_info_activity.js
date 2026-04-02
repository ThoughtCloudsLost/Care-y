/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Info_ActivityInputs */

const en_dashboard_info_activity = /** @type {(inputs: Dashboard_Info_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recent`)
};

const es_dashboard_info_activity = /** @type {(inputs: Dashboard_Info_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reciente`)
};

/**
* | output |
* | --- |
* | "Recent" |
*
* @param {Dashboard_Info_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_activity = /** @type {((inputs?: Dashboard_Info_ActivityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_ActivityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_activity(inputs)
	return es_dashboard_info_activity(inputs)
});