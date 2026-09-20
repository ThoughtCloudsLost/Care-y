/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Shift_No_ShiftInputs */

const en_dashboard_shift_no_shift = /** @type {(inputs: Dashboard_Shift_No_ShiftInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No active shift`)
};

const es_dashboard_shift_no_shift = /** @type {(inputs: Dashboard_Shift_No_ShiftInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin turno activo`)
};

const en_xa2_dashboard_shift_no_shift = /** @type {(inputs: Dashboard_Shift_No_ShiftInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àctìvè shìft •••••⟧`)
};

/**
* | output |
* | --- |
* | "No active shift" |
*
* @param {Dashboard_Shift_No_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_no_shift = /** @type {((inputs?: Dashboard_Shift_No_ShiftInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_No_ShiftInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_shift_no_shift(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_shift_no_shift(inputs)
	return en_dashboard_shift_no_shift(inputs)
});