/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Demo_Flow_Detail_Rows_AffectedInputs */

const en_demo_flow_detail_rows_affected = /** @type {(inputs: Demo_Flow_Detail_Rows_AffectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} rows affected`)
};

const es_demo_flow_detail_rows_affected = /** @type {(inputs: Demo_Flow_Detail_Rows_AffectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} filas afectadas`)
};

/**
* | output |
* | --- |
* | "{count} rows affected" |
*
* @param {Demo_Flow_Detail_Rows_AffectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_rows_affected = /** @type {((inputs: Demo_Flow_Detail_Rows_AffectedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Rows_AffectedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_rows_affected(inputs)
	return es_demo_flow_detail_rows_affected(inputs)
});