/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_EmptyInputs */

const en_demo_flow_empty = /** @type {(inputs: Demo_Flow_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No activity yet. Use the simulator and each step of the flow appears here.`)
};

const es_demo_flow_empty = /** @type {(inputs: Demo_Flow_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todavía no hay actividad. Usa el simulador y cada paso del flujo aparece aquí.`)
};

const en_xa2_demo_flow_empty = /** @type {(inputs: Demo_Flow_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àctìvìty yèt. Ùsè thè sìmùlàtòr ànd èàch stèp òf thè flòw àppèàrs hèrè. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No activity yet. Use the simulator and each step of the flow appears here." |
*
* @param {Demo_Flow_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_empty = /** @type {((inputs?: Demo_Flow_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_empty(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_empty(inputs)
	return en_demo_flow_empty(inputs)
});