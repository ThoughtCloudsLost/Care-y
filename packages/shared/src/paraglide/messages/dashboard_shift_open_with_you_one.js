/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Shift_Open_With_You_OneInputs */

const en_dashboard_shift_open_with_you_one = /** @type {(inputs: Dashboard_Shift_Open_With_You_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} open with you`)
};

const es_dashboard_shift_open_with_you_one = /** @type {(inputs: Dashboard_Shift_Open_With_You_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} abierto contigo`)
};

/**
* | output |
* | --- |
* | "{count} open with you" |
*
* @param {Dashboard_Shift_Open_With_You_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_open_with_you_one = /** @type {((inputs: Dashboard_Shift_Open_With_You_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_Open_With_You_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_shift_open_with_you_one(inputs)
	return es_dashboard_shift_open_with_you_one(inputs)
});