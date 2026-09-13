/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Rich_Text_Preview_EmptyInputs */

const en_intake_forms_rich_text_preview_empty = /** @type {(inputs: Intake_Forms_Rich_Text_Preview_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No content`)
};

const es_intake_forms_rich_text_preview_empty = /** @type {(inputs: Intake_Forms_Rich_Text_Preview_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin contenido`)
};

/**
* | output |
* | --- |
* | "No content" |
*
* @param {Intake_Forms_Rich_Text_Preview_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_rich_text_preview_empty = /** @type {((inputs?: Intake_Forms_Rich_Text_Preview_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Rich_Text_Preview_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_rich_text_preview_empty(inputs)
	return es_intake_forms_rich_text_preview_empty(inputs)
});