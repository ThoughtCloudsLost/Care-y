/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Default_ToggleInputs */

const en_intake_forms_default_toggle = /** @type {(inputs: Intake_Forms_Default_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default form`)
};

const es_intake_forms_default_toggle = /** @type {(inputs: Intake_Forms_Default_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario predeterminado`)
};

/**
* | output |
* | --- |
* | "Default form" |
*
* @param {Intake_Forms_Default_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_default_toggle = /** @type {((inputs?: Intake_Forms_Default_ToggleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Default_ToggleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_default_toggle(inputs)
	return es_intake_forms_default_toggle(inputs)
});