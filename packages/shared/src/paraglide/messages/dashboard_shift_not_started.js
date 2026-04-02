/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ time: NonNullable<unknown>, start: NonNullable<unknown>, end: NonNullable<unknown> }} Dashboard_Shift_Not_StartedInputs */

const en_dashboard_shift_not_started = /** @type {(inputs: Dashboard_Shift_Not_StartedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Starts in ${i?.time} (${i?.start} - ${i?.end})`)
};

const es_dashboard_shift_not_started = /** @type {(inputs: Dashboard_Shift_Not_StartedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Comienza en ${i?.time} (${i?.start} - ${i?.end})`)
};

/**
* | output |
* | --- |
* | "Starts in {time} ({start} - {end})" |
*
* @param {Dashboard_Shift_Not_StartedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_not_started = /** @type {((inputs: Dashboard_Shift_Not_StartedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_Not_StartedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_shift_not_started(inputs)
	return es_dashboard_shift_not_started(inputs)
});