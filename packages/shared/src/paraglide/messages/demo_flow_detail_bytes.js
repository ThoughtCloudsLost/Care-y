/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Demo_Flow_Detail_BytesInputs */

const en_demo_flow_detail_bytes = /** @type {(inputs: Demo_Flow_Detail_BytesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} bytes`)
};

const es_demo_flow_detail_bytes = /** @type {(inputs: Demo_Flow_Detail_BytesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} bytes`)
};

/**
* | output |
* | --- |
* | "{count} bytes" |
*
* @param {Demo_Flow_Detail_BytesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_bytes = /** @type {((inputs: Demo_Flow_Detail_BytesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_BytesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_bytes(inputs)
	return es_demo_flow_detail_bytes(inputs)
});