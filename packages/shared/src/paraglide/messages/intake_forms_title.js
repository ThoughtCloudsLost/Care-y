/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_TitleInputs */

const en_intake_forms_title = /** @type {(inputs: Intake_Forms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake Forms`)
};

const es_intake_forms_title = /** @type {(inputs: Intake_Forms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formularios de admision`)
};

/**
* | output |
* | --- |
* | "Intake Forms" |
*
* @param {Intake_Forms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_title = /** @type {((inputs?: Intake_Forms_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_title(inputs)
	return es_intake_forms_title(inputs)
});