/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_ActivatedInputs */

const en_intake_forms_activated = /** @type {(inputs: Intake_Forms_ActivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form activated`)
};

const es_intake_forms_activated = /** @type {(inputs: Intake_Forms_ActivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario activado`)
};

/**
* | output |
* | --- |
* | "Form activated" |
*
* @param {Intake_Forms_ActivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_activated = /** @type {((inputs?: Intake_Forms_ActivatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_ActivatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_activated(inputs)
	return es_intake_forms_activated(inputs)
});