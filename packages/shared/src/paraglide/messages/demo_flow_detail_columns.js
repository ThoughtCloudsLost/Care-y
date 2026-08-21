/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Demo_Flow_Detail_ColumnsInputs */

const en_demo_flow_detail_columns = /** @type {(inputs: Demo_Flow_Detail_ColumnsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} columns`)
};

const es_demo_flow_detail_columns = /** @type {(inputs: Demo_Flow_Detail_ColumnsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} columnas`)
};

/**
* | output |
* | --- |
* | "{count} columns" |
*
* @param {Demo_Flow_Detail_ColumnsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_columns = /** @type {((inputs: Demo_Flow_Detail_ColumnsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_ColumnsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_columns(inputs)
	return es_demo_flow_detail_columns(inputs)
});