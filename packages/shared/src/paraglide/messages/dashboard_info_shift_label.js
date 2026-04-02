/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ label: NonNullable<unknown> }} Dashboard_Info_Shift_LabelInputs */

const en_dashboard_info_shift_label = /** @type {(inputs: Dashboard_Info_Shift_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.label}`)
};

const es_dashboard_info_shift_label = /** @type {(inputs: Dashboard_Info_Shift_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.label}`)
};

/**
* | output |
* | --- |
* | "{label}" |
*
* @param {Dashboard_Info_Shift_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_shift_label = /** @type {((inputs: Dashboard_Info_Shift_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Info_Shift_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_info_shift_label(inputs)
	return es_dashboard_info_shift_label(inputs)
});