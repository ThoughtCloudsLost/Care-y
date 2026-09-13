/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_TitleInputs */

const en_intake_title = /** @type {(inputs: Intake_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Get help`)
};

const es_intake_title = /** @type {(inputs: Intake_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pedir ayuda`)
};

/**
* | output |
* | --- |
* | "Get help" |
*
* @param {Intake_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_title = /** @type {((inputs?: Intake_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_title(inputs)
	return es_intake_title(inputs)
});