/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Mode_ExploreInputs */

const en_demo_mode_explore = /** @type {(inputs: Demo_Mode_ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Explore`)
};

const es_demo_mode_explore = /** @type {(inputs: Demo_Mode_ExploreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Explorar`)
};

/**
* | output |
* | --- |
* | "Explore" |
*
* @param {Demo_Mode_ExploreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_mode_explore = /** @type {((inputs?: Demo_Mode_ExploreInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Mode_ExploreInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_mode_explore(inputs)
	return es_demo_mode_explore(inputs)
});