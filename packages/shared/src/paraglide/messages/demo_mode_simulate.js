/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Mode_SimulateInputs */

const en_demo_mode_simulate = /** @type {(inputs: Demo_Mode_SimulateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulate`)
};

const es_demo_mode_simulate = /** @type {(inputs: Demo_Mode_SimulateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simular`)
};

/**
* | output |
* | --- |
* | "Simulate" |
*
* @param {Demo_Mode_SimulateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_simulate = /** @type {((inputs?: Demo_Mode_SimulateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Mode_SimulateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_mode_simulate(inputs)
	return es_demo_mode_simulate(inputs)
});