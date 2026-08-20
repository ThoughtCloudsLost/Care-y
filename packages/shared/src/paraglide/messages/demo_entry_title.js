/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_TitleInputs */

const en_demo_entry_title = /** @type {(inputs: Demo_Entry_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How CARE-Y works`)
};

const es_demo_entry_title = /** @type {(inputs: Demo_Entry_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo funciona CARE-Y`)
};

/**
* | output |
* | --- |
* | "How CARE-Y works" |
*
* @param {Demo_Entry_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_title = /** @type {((inputs?: Demo_Entry_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_title(inputs)
	return es_demo_entry_title(inputs)
});