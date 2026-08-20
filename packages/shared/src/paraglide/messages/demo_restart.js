/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_RestartInputs */

const en_demo_restart = /** @type {(inputs: Demo_RestartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restart`)
};

const es_demo_restart = /** @type {(inputs: Demo_RestartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reiniciar`)
};

/**
* | output |
* | --- |
* | "Restart" |
*
* @param {Demo_RestartInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_restart = /** @type {((inputs?: Demo_RestartInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_RestartInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_restart(inputs)
	return es_demo_restart(inputs)
});