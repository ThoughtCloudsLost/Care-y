/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Info_Volunteers_On_ShiftInputs */

const en_dashboard_info_volunteers_on_shift = /** @type {(inputs: Dashboard_Info_Volunteers_On_ShiftInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} on shift`)
};

const es_dashboard_info_volunteers_on_shift = /** @type {(inputs: Dashboard_Info_Volunteers_On_ShiftInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} en turno`)
};

/**
* | output |
* | --- |
* | "{count} on shift" |
*
* @param {Dashboard_Info_Volunteers_On_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_volunteers_on_shift = /** @type {((inputs: Dashboard_Info_Volunteers_On_ShiftInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_Volunteers_On_ShiftInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_volunteers_on_shift(inputs)
	return es_dashboard_info_volunteers_on_shift(inputs)
});