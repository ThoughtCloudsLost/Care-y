/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Info_No_KbInputs */

const en_dashboard_info_no_kb = /** @type {(inputs: Dashboard_Info_No_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No recent articles`)
};

const es_dashboard_info_no_kb = /** @type {(inputs: Dashboard_Info_No_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin articulos recientes`)
};

/**
* | output |
* | --- |
* | "No recent articles" |
*
* @param {Dashboard_Info_No_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_no_kb = /** @type {((inputs?: Dashboard_Info_No_KbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_No_KbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_no_kb(inputs)
	return es_dashboard_info_no_kb(inputs)
});