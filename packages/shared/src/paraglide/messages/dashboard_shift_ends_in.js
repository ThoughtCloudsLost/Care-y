/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ time: NonNullable<unknown>, start: NonNullable<unknown>, end: NonNullable<unknown> }} Dashboard_Shift_Ends_InInputs */

const en_dashboard_shift_ends_in = /** @type {(inputs: Dashboard_Shift_Ends_InInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ends in ${i?.time} (${i?.start} - ${i?.end})`)
};

const es_dashboard_shift_ends_in = /** @type {(inputs: Dashboard_Shift_Ends_InInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Termina en ${i?.time} (${i?.start} - ${i?.end})`)
};

/**
* | output |
* | --- |
* | "Ends in {time} ({start} - {end})" |
*
* @param {Dashboard_Shift_Ends_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_ends_in = /** @type {((inputs: Dashboard_Shift_Ends_InInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_Ends_InInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_shift_ends_in(inputs)
	return es_dashboard_shift_ends_in(inputs)
});