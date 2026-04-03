/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Shift_HeadingInputs */

const en_dashboard_shift_heading = /** @type {(inputs: Dashboard_Shift_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shift`)
};

const es_dashboard_shift_heading = /** @type {(inputs: Dashboard_Shift_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Turno`)
};

/**
* | output |
* | --- |
* | "Shift" |
*
* @param {Dashboard_Shift_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_heading = /** @type {((inputs?: Dashboard_Shift_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_shift_heading(inputs)
	return es_dashboard_shift_heading(inputs)
});