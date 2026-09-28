/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Form_Asset_UploadedInputs */

const en_audit_event_form_asset_uploaded = /** @type {(inputs: Audit_Event_Form_Asset_UploadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake form image uploaded`)
};

const es_audit_event_form_asset_uploaded = /** @type {(inputs: Audit_Event_Form_Asset_UploadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imagen de formulario de admisión subida`)
};

const en_xa2_audit_event_form_asset_uploaded = /** @type {(inputs: Audit_Event_Form_Asset_UploadedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè fòrm ìmàgè ùplòàdèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake form image uploaded" |
*
* @param {Audit_Event_Form_Asset_UploadedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_form_asset_uploaded = /** @type {((inputs?: Audit_Event_Form_Asset_UploadedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Form_Asset_UploadedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_form_asset_uploaded(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_form_asset_uploaded(inputs)
	return en_audit_event_form_asset_uploaded(inputs)
});