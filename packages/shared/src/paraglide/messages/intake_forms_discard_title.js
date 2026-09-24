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

const en_xa2_intake_forms_discard_title = /** @type {(inputs: Intake_Forms_Discard_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnsàvèd chàngès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Unsaved changes" |
*
* @param {Intake_Forms_Discard_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_discard_title = /** @type {((inputs?: Intake_Forms_Discard_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Discard_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_discard_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_discard_title(inputs)
	return en_intake_forms_discard_title(inputs)
});