/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_File_TypeInputs */

const en_intake_forms_banner_file_type = /** @type {(inputs: Intake_Forms_Banner_File_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only PNG, JPEG, and WebP images are allowed.`)
};

const es_intake_forms_banner_file_type = /** @type {(inputs: Intake_Forms_Banner_File_TypeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo se permiten imagenes PNG, JPEG y WebP.`)
};

/**
* | output |
* | --- |
* | "Only PNG, JPEG, and WebP images are allowed." |
*
* @param {Intake_Forms_Banner_File_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_file_type = /** @type {((inputs?: Intake_Forms_Banner_File_TypeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_File_TypeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_banner_file_type(inputs)
	return es_intake_forms_banner_file_type(inputs)
});