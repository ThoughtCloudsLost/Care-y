/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_UnbindInputs */

const en_intake_forms_unbind = /** @type {(inputs: Intake_Forms_UnbindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unbind`)
};

const es_intake_forms_unbind = /** @type {(inputs: Intake_Forms_UnbindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desvincular`)
};

/**
* | output |
* | --- |
* | "Unbind" |
*
* @param {Intake_Forms_UnbindInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_unbind = /** @type {((inputs?: Intake_Forms_UnbindInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_UnbindInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_unbind(inputs)
	return es_intake_forms_unbind(inputs)
});