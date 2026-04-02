/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ start: NonNullable<unknown>, end: NonNullable<unknown> }} Dashboard_Info_ShiftInputs */

const en_dashboard_info_shift = /** @type {(inputs: Dashboard_Info_ShiftInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Shift: ${i?.start} - ${i?.end}`)
};

const es_dashboard_info_shift = /** @type {(inputs: Dashboard_Info_ShiftInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Turno: ${i?.start} - ${i?.end}`)
};

/**
* | output |
* | --- |
* | "Shift: {start} - {end}" |
*
* @param {Dashboard_Info_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_shift = /** @type {((inputs: Dashboard_Info_ShiftInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_ShiftInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_shift(inputs)
	return es_dashboard_info_shift(inputs)
});