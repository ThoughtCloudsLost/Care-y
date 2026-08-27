/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Preview_Empty_TitleInputs */

const en_intake_forms_preview_empty_title = /** @type {(inputs: Intake_Forms_Preview_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No fields yet`)
};

const es_intake_forms_preview_empty_title = /** @type {(inputs: Intake_Forms_Preview_Empty_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay campos`)
};

/**
* | output |
* | --- |
* | "No fields yet" |
*
* @param {Intake_Forms_Preview_Empty_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_empty_title = /** @type {((inputs?: Intake_Forms_Preview_Empty_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_Empty_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_preview_empty_title(inputs)
	return es_intake_forms_preview_empty_title(inputs)
});