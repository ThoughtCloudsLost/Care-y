/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_CloseInputs */

const en_demo_flow_close = /** @type {(inputs: Demo_Flow_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close the data flow panel`)
};

const es_demo_flow_close = /** @type {(inputs: Demo_Flow_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar el panel de flujo de datos`)
};

/**
* | output |
* | --- |
* | "Close the data flow panel" |
*
* @param {Demo_Flow_CloseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_close = /** @type {((inputs?: Demo_Flow_CloseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_CloseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_close(inputs)
	return es_demo_flow_close(inputs)
});