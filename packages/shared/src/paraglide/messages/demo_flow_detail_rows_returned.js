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

const en_xa2_demo_flow_detail_rows_returned = /** @type {(inputs: Demo_Flow_Detail_Rows_ReturnedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} ròws rètùrnèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} rows returned" |
*
* @param {Demo_Flow_Detail_Rows_ReturnedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_rows_returned = /** @type {((inputs: Demo_Flow_Detail_Rows_ReturnedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Rows_ReturnedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_rows_returned(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_rows_returned(inputs)
	return en_demo_flow_detail_rows_returned(inputs)
});