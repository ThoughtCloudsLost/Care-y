/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Shift_EndInputs */

const en_dashboard_shift_end = /** @type {(inputs: Dashboard_Shift_EndInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`End shift`)
};

const es_dashboard_shift_end = /** @type {(inputs: Dashboard_Shift_EndInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminar turno`)
};

/**
* | output |
* | --- |
* | "End shift" |
*
* @param {Dashboard_Shift_EndInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_end = /** @type {((inputs?: Dashboard_Shift_EndInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_EndInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_shift_end(inputs)
	return es_dashboard_shift_end(inputs)
});