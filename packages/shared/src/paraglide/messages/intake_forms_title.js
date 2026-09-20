/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_TitleInputs */

const en_intake_forms_title = /** @type {(inputs: Intake_Forms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake Forms`)
};

const es_intake_forms_title = /** @type {(inputs: Intake_Forms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formularios de admisión`)
};

const en_xa2_intake_forms_title = /** @type {(inputs: Intake_Forms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè Fòrms ••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake Forms" |
*
* @param {Intake_Forms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_title = /** @type {((inputs?: Intake_Forms_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_title(inputs)
	return en_intake_forms_title(inputs)
});