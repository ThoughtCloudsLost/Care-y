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

const en_xa2_intake_forms_unbind = /** @type {(inputs: Intake_Forms_UnbindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnbìnd ••⟧`)
};

/**
* | output |
* | --- |
* | "Unbind" |
*
* @param {Intake_Forms_UnbindInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_unbind = /** @type {((inputs?: Intake_Forms_UnbindInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_UnbindInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_unbind(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_unbind(inputs)
	return en_intake_forms_unbind(inputs)
});