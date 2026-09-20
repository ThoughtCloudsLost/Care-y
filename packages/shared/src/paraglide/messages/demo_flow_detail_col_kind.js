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

const en_xa2_demo_flow_detail_col_kind = /** @type {(inputs: Demo_Flow_Detail_Col_KindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kìnd ••⟧`)
};

/**
* | output |
* | --- |
* | "Kind" |
*
* @param {Demo_Flow_Detail_Col_KindInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_col_kind = /** @type {((inputs?: Demo_Flow_Detail_Col_KindInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Col_KindInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_col_kind(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_col_kind(inputs)
	return en_demo_flow_detail_col_kind(inputs)
});