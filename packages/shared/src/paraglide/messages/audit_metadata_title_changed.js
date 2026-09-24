/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Metadata_Title_ChangedInputs */

const en_audit_metadata_title_changed = /** @type {(inputs: Audit_Metadata_Title_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title changed`)
};

const es_audit_metadata_title_changed = /** @type {(inputs: Audit_Metadata_Title_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Título cambiado`)
};

const en_xa2_audit_metadata_title_changed = /** @type {(inputs: Audit_Metadata_Title_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìtlè chàngèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Title changed" |
*
* @param {Audit_Metadata_Title_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_metadata_title_changed = /** @type {((inputs?: Audit_Metadata_Title_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Metadata_Title_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_metadata_title_changed(inputs)
	if (locale === "en-XA") return en_xa2_audit_metadata_title_changed(inputs)
	return en_audit_metadata_title_changed(inputs)
});