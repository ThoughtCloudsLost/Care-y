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

const en_xa2_intake_forms_content_heading = /** @type {(inputs: Intake_Forms_Content_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòrm còntènt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Form content" |
*
* @param {Intake_Forms_Content_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_content_heading = /** @type {((inputs?: Intake_Forms_Content_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Content_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_content_heading(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_content_heading(inputs)
	return en_intake_forms_content_heading(inputs)
});