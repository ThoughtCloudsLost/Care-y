/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Page_BackInputs */

const en_intake_page_back = /** @type {(inputs: Intake_Page_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back`)
};

const es_intake_page_back = /** @type {(inputs: Intake_Page_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Atrás`)
};

const en_xa2_intake_page_back = /** @type {(inputs: Intake_Page_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàck ••⟧`)
};

/**
* | output |
* | --- |
* | "Back" |
*
* @param {Intake_Page_BackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_back = /** @type {((inputs?: Intake_Page_BackInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_BackInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_page_back(inputs)
	if (locale === "en-XA") return en_xa2_intake_page_back(inputs)
	return en_intake_page_back(inputs)
});