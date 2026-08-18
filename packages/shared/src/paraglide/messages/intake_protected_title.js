/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_TitleInputs */

const en_intake_protected_title = /** @type {(inputs: Intake_Protected_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How you're protected`)
};

const es_intake_protected_title = /** @type {(inputs: Intake_Protected_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como te protegemos`)
};

/**
* | output |
* | --- |
* | "How you're protected" |
*
* @param {Intake_Protected_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_title = /** @type {((inputs?: Intake_Protected_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_title(inputs)
	return es_intake_protected_title(inputs)
});