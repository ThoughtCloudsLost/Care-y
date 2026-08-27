/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_File_Too_LargeInputs */

const en_intake_forms_banner_file_too_large = /** @type {(inputs: Intake_Forms_Banner_File_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Banner image exceeds the maximum file size.`)
};

const es_intake_forms_banner_file_too_large = /** @type {(inputs: Intake_Forms_Banner_File_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La imagen de portada excede el tamano maximo de archivo.`)
};

/**
* | output |
* | --- |
* | "Banner image exceeds the maximum file size." |
*
* @param {Intake_Forms_Banner_File_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_file_too_large = /** @type {((inputs?: Intake_Forms_Banner_File_Too_LargeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_File_Too_LargeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_banner_file_too_large(inputs)
	return es_intake_forms_banner_file_too_large(inputs)
});