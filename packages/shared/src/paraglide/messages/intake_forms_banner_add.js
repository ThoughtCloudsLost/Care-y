/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_AddInputs */

const en_intake_forms_banner_add = /** @type {(inputs: Intake_Forms_Banner_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add banner image`)
};

const es_intake_forms_banner_add = /** @type {(inputs: Intake_Forms_Banner_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar imagen de portada`)
};

/**
* | output |
* | --- |
* | "Add banner image" |
*
* @param {Intake_Forms_Banner_AddInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_add = /** @type {((inputs?: Intake_Forms_Banner_AddInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_AddInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_banner_add(inputs)
	return es_intake_forms_banner_add(inputs)
});