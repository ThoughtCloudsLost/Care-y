/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Description_PlaceholderInputs */

const en_intake_forms_description_placeholder = /** @type {(inputs: Intake_Forms_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown above the form instead of the default intro text.`)
};

const es_intake_forms_description_placeholder = /** @type {(inputs: Intake_Forms_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra sobre el formulario en lugar del texto introductorio predeterminado.`)
};

/**
* | output |
* | --- |
* | "Shown above the form instead of the default intro text." |
*
* @param {Intake_Forms_Description_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_description_placeholder = /** @type {((inputs?: Intake_Forms_Description_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Description_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_description_placeholder(inputs)
	return es_intake_forms_description_placeholder(inputs)
});