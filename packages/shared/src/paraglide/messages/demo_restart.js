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

const en_xa2_demo_restart = /** @type {(inputs: Demo_RestartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèstàrt •••⟧`)
};

/**
* | output |
* | --- |
* | "Restart" |
*
* @param {Demo_RestartInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_restart = /** @type {((inputs?: Demo_RestartInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_RestartInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_restart(inputs)
	if (locale === "en-XA") return en_xa2_demo_restart(inputs)
	return en_demo_restart(inputs)
});