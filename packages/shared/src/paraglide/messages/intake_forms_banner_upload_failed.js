/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Banner_Upload_FailedInputs */

const en_intake_forms_banner_upload_failed = /** @type {(inputs: Intake_Forms_Banner_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Banner upload failed.`)
};

const es_intake_forms_banner_upload_failed = /** @type {(inputs: Intake_Forms_Banner_Upload_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al subir la portada.`)
};

/**
* | output |
* | --- |
* | "Banner upload failed." |
*
* @param {Intake_Forms_Banner_Upload_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_upload_failed = /** @type {((inputs?: Intake_Forms_Banner_Upload_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Banner_Upload_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_banner_upload_failed(inputs)
	return es_intake_forms_banner_upload_failed(inputs)
});