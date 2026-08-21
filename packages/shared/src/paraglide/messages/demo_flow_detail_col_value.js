/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_Col_ValueInputs */

const en_demo_flow_detail_col_value = /** @type {(inputs: Demo_Flow_Detail_Col_ValueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Value`)
};

const es_demo_flow_detail_col_value = /** @type {(inputs: Demo_Flow_Detail_Col_ValueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Valor`)
};

/**
* | output |
* | --- |
* | "Value" |
*
* @param {Demo_Flow_Detail_Col_ValueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_col_value = /** @type {((inputs?: Demo_Flow_Detail_Col_ValueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Col_ValueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_col_value(inputs)
	return es_demo_flow_detail_col_value(inputs)
});