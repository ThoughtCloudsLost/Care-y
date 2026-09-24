/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_File_Too_LargeInputs */

const en_intake_forms_banner_file_too_large = /** @type {(inputs: Intake_Forms_Banner_File_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Banner image exceeds the maximum file size.`)
};

const es_intake_forms_banner_file_too_large = /** @type {(inputs: Intake_Forms_Banner_File_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La imagen de portada excede el tamaño máximo de archivo.`)
};

const en_xa2_intake_forms_banner_file_too_large = /** @type {(inputs: Intake_Forms_Banner_File_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bànnèr ìmàgè èxcèèds thè màxìmùm fìlè sìzè. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Banner image exceeds the maximum file size." |
*
* @param {Intake_Forms_Banner_File_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_file_too_large = /** @type {((inputs?: Intake_Forms_Banner_File_Too_LargeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_File_Too_LargeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_banner_file_too_large(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_banner_file_too_large(inputs)
	return en_intake_forms_banner_file_too_large(inputs)
});