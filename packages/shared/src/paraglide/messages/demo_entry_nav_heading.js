/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Nav_HeadingInputs */

const en_demo_entry_nav_heading = /** @type {(inputs: Demo_Entry_Nav_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navigation`)
};

const es_demo_entry_nav_heading = /** @type {(inputs: Demo_Entry_Nav_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navegacion`)
};

/**
* | output |
* | --- |
* | "Navigation" |
*
* @param {Demo_Entry_Nav_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_nav_heading = /** @type {((inputs?: Demo_Entry_Nav_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Nav_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_nav_heading(inputs)
	return es_demo_entry_nav_heading(inputs)
});