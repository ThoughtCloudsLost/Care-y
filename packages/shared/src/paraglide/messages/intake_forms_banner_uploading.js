/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_UploadingInputs */

const en_intake_forms_banner_uploading = /** @type {(inputs: Intake_Forms_Banner_UploadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uploading banner...`)
};

const es_intake_forms_banner_uploading = /** @type {(inputs: Intake_Forms_Banner_UploadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Subiendo portada...`)
};

const en_xa2_intake_forms_banner_uploading = /** @type {(inputs: Intake_Forms_Banner_UploadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùplòàdìng bànnèr... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Uploading banner..." |
*
* @param {Intake_Forms_Banner_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_uploading = /** @type {((inputs?: Intake_Forms_Banner_UploadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_UploadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_banner_uploading(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_banner_uploading(inputs)
	return en_intake_forms_banner_uploading(inputs)
});