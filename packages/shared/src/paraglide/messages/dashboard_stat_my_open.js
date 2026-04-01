/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Stat_My_OpenInputs */

const en_dashboard_stat_my_open = /** @type {(inputs: Dashboard_Stat_My_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My Open`)
};

const es_dashboard_stat_my_open = /** @type {(inputs: Dashboard_Stat_My_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mis abiertos`)
};

/**
* | output |
* | --- |
* | "My Open" |
*
* @param {Dashboard_Stat_My_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_stat_my_open = /** @type {((inputs?: Dashboard_Stat_My_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Stat_My_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_stat_my_open(inputs)
	return es_dashboard_stat_my_open(inputs)
});