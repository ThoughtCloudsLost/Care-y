/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_PreviewInputs */

const en_intake_forms_preview = /** @type {(inputs: Intake_Forms_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preview`)
};

const es_intake_forms_preview = /** @type {(inputs: Intake_Forms_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista previa`)
};

/**
* | output |
* | --- |
* | "Preview" |
*
* @param {Intake_Forms_PreviewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview = /** @type {((inputs?: Intake_Forms_PreviewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_PreviewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_preview(inputs)
	return es_intake_forms_preview(inputs)
});