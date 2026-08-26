/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Page_BackInputs */

const en_intake_page_back = /** @type {(inputs: Intake_Page_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back`)
};

const es_intake_page_back = /** @type {(inputs: Intake_Page_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Atras`)
};

/**
* | output |
* | --- |
* | "Back" |
*
* @param {Intake_Page_BackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_page_back = /** @type {((inputs?: Intake_Page_BackInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_BackInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_page_back(inputs)
	return es_intake_page_back(inputs)
});