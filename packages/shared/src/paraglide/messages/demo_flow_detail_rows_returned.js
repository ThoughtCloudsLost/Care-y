/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Demo_Flow_Detail_Rows_ReturnedInputs */

const en_demo_flow_detail_rows_returned = /** @type {(inputs: Demo_Flow_Detail_Rows_ReturnedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} rows returned`)
};

const es_demo_flow_detail_rows_returned = /** @type {(inputs: Demo_Flow_Detail_Rows_ReturnedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} filas devueltas`)
};

/**
* | output |
* | --- |
* | "{count} rows returned" |
*
* @param {Demo_Flow_Detail_Rows_ReturnedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_rows_returned = /** @type {((inputs: Demo_Flow_Detail_Rows_ReturnedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Rows_ReturnedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_rows_returned(inputs)
	return es_demo_flow_detail_rows_returned(inputs)
});