/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Status_Bar_TimeInputs */

const en_demo_status_bar_time = /** @type {(inputs: Demo_Status_Bar_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`9:41`)
};

const es_demo_status_bar_time = /** @type {(inputs: Demo_Status_Bar_TimeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`9:41`)
};

/**
* | output |
* | --- |
* | "9:41" |
*
* @param {Demo_Status_Bar_TimeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_status_bar_time = /** @type {((inputs?: Demo_Status_Bar_TimeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Status_Bar_TimeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_status_bar_time(inputs)
	return es_demo_status_bar_time(inputs)
});