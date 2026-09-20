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

const en_xa2_demo_mode_simulate = /** @type {(inputs: Demo_Mode_SimulateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìmùlàtè •••⟧`)
};

/**
* | output |
* | --- |
* | "Simulate" |
*
* @param {Demo_Mode_SimulateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_mode_simulate = /** @type {((inputs?: Demo_Mode_SimulateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Mode_SimulateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_mode_simulate(inputs)
	if (locale === "en-XA") return en_xa2_demo_mode_simulate(inputs)
	return en_demo_mode_simulate(inputs)
});