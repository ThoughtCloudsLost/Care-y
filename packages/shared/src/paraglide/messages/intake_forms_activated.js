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

const en_xa2_intake_forms_activated = /** @type {(inputs: Intake_Forms_ActivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòrm àctìvàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Form activated" |
*
* @param {Intake_Forms_ActivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_activated = /** @type {((inputs?: Intake_Forms_ActivatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_ActivatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_activated(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_activated(inputs)
	return en_intake_forms_activated(inputs)
});