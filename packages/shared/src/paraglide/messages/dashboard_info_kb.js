/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Info_KbInputs */

const en_dashboard_info_kb = /** @type {(inputs: Dashboard_Info_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`KB Updates`)
};

const es_dashboard_info_kb = /** @type {(inputs: Dashboard_Info_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Novedades KB`)
};

/**
* | output |
* | --- |
* | "KB Updates" |
*
* @param {Dashboard_Info_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_kb = /** @type {((inputs?: Dashboard_Info_KbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_KbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_kb(inputs)
	return es_dashboard_info_kb(inputs)
});