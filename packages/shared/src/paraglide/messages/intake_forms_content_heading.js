/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Content_HeadingInputs */

const en_intake_forms_content_heading = /** @type {(inputs: Intake_Forms_Content_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form content`)
};

const es_intake_forms_content_heading = /** @type {(inputs: Intake_Forms_Content_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contenido del formulario`)
};

/**
* | output |
* | --- |
* | "Form content" |
*
* @param {Intake_Forms_Content_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_content_heading = /** @type {((inputs?: Intake_Forms_Content_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Content_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_content_heading(inputs)
	return es_intake_forms_content_heading(inputs)
});