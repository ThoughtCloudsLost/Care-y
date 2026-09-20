/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_PayloadInputs */

const en_demo_flow_detail_payload = /** @type {(inputs: Demo_Flow_Detail_PayloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Payload preview`)
};

const es_demo_flow_detail_payload = /** @type {(inputs: Demo_Flow_Detail_PayloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista previa del contenido`)
};

const en_xa2_demo_flow_detail_payload = /** @type {(inputs: Demo_Flow_Detail_PayloadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàylòàd prèvìèw •••••⟧`)
};

/**
* | output |
* | --- |
* | "Payload preview" |
*
* @param {Demo_Flow_Detail_PayloadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_payload = /** @type {((inputs?: Demo_Flow_Detail_PayloadInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_PayloadInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_payload(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_payload(inputs)
	return en_demo_flow_detail_payload(inputs)
});