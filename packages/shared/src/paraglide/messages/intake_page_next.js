/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Page_NextInputs */

const en_intake_page_next = /** @type {(inputs: Intake_Page_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Next`)
};

const es_intake_page_next = /** @type {(inputs: Intake_Page_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Siguiente`)
};

/**
* | output |
* | --- |
* | "Next" |
*
* @param {Intake_Page_NextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_page_next = /** @type {((inputs?: Intake_Page_NextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_NextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_page_next(inputs)
	return es_intake_page_next(inputs)
});