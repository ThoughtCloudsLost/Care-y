/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Shift_Open_With_You_OtherInputs */

const en_dashboard_shift_open_with_you_other = /** @type {(inputs: Dashboard_Shift_Open_With_You_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open with you`)
};

const es_dashboard_shift_open_with_you_other = /** @type {(inputs: Dashboard_Shift_Open_With_You_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} abiertos contigo`)
};

const en_xa2_dashboard_shift_open_with_you_other = /** @type {(inputs: Dashboard_Shift_Open_With_You_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òpèn wìth yòù •••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} open with you" |
*
* @param {Dashboard_Shift_Open_With_You_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_open_with_you_other = /** @type {((inputs: Dashboard_Shift_Open_With_You_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_Open_With_You_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_shift_open_with_you_other(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_shift_open_with_you_other(inputs)
	return en_dashboard_shift_open_with_you_other(inputs)
});