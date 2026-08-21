/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_Col_KindInputs */

const en_demo_flow_detail_col_kind = /** @type {(inputs: Demo_Flow_Detail_Col_KindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kind`)
};

const es_demo_flow_detail_col_kind = /** @type {(inputs: Demo_Flow_Detail_Col_KindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipo`)
};

/**
* | output |
* | --- |
* | "Kind" |
*
* @param {Demo_Flow_Detail_Col_KindInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_col_kind = /** @type {((inputs?: Demo_Flow_Detail_Col_KindInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Col_KindInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_col_kind(inputs)
	return es_demo_flow_detail_col_kind(inputs)
});