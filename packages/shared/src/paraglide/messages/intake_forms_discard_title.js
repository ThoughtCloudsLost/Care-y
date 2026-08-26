/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Discard_TitleInputs */

const en_intake_forms_discard_title = /** @type {(inputs: Intake_Forms_Discard_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unsaved changes`)
};

const es_intake_forms_discard_title = /** @type {(inputs: Intake_Forms_Discard_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios sin guardar`)
};

/**
* | output |
* | --- |
* | "Unsaved changes" |
*
* @param {Intake_Forms_Discard_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_discard_title = /** @type {((inputs?: Intake_Forms_Discard_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Discard_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_discard_title(inputs)
	return es_intake_forms_discard_title(inputs)
});