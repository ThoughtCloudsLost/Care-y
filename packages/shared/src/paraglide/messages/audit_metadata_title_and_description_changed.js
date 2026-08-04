/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Metadata_Title_And_Description_ChangedInputs */

const en_audit_metadata_title_and_description_changed = /** @type {(inputs: Audit_Metadata_Title_And_Description_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title and description changed`)
};

const es_audit_metadata_title_and_description_changed = /** @type {(inputs: Audit_Metadata_Title_And_Description_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Titulo y descripcion cambiados`)
};

/**
* | output |
* | --- |
* | "Title and description changed" |
*
* @param {Audit_Metadata_Title_And_Description_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_metadata_title_and_description_changed = /** @type {((inputs?: Audit_Metadata_Title_And_Description_ChangedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Metadata_Title_And_Description_ChangedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_metadata_title_and_description_changed(inputs)
	return es_audit_metadata_title_and_description_changed(inputs)
});