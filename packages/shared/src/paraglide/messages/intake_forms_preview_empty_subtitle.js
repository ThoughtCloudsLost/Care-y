/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Preview_Empty_SubtitleInputs */

const en_intake_forms_preview_empty_subtitle = /** @type {(inputs: Intake_Forms_Preview_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add fields to see how the form will look to clients.`)
};

const es_intake_forms_preview_empty_subtitle = /** @type {(inputs: Intake_Forms_Preview_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agrega campos para ver cómo se verá el formulario para los clientes.`)
};

/**
* | output |
* | --- |
* | "Add fields to see how the form will look to clients." |
*
* @param {Intake_Forms_Preview_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_empty_subtitle = /** @type {((inputs?: Intake_Forms_Preview_Empty_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_Empty_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_preview_empty_subtitle(inputs)
	return es_intake_forms_preview_empty_subtitle(inputs)
});