/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_HeadingInputs */

const en_getting_started_heading = /** @type {(inputs: Getting_Started_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Getting Started`)
};

const es_getting_started_heading = /** @type {(inputs: Getting_Started_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Primeros pasos`)
};

/**
* | output |
* | --- |
* | "Getting Started" |
*
* @param {Getting_Started_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_heading = /** @type {((inputs?: Getting_Started_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_heading(inputs)
	return es_getting_started_heading(inputs)
});