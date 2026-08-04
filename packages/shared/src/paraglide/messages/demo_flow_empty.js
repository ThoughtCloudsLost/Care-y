/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_EmptyInputs */

const en_demo_flow_empty = /** @type {(inputs: Demo_Flow_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No activity yet. Use the phone and each step of the flow appears here.`)
};

const es_demo_flow_empty = /** @type {(inputs: Demo_Flow_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todavia no hay actividad. Usa el telefono y cada paso del flujo aparece aqui.`)
};

/**
* | output |
* | --- |
* | "No activity yet. Use the phone and each step of the flow appears here." |
*
* @param {Demo_Flow_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_empty = /** @type {((inputs?: Demo_Flow_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_empty(inputs)
	return es_demo_flow_empty(inputs)
});