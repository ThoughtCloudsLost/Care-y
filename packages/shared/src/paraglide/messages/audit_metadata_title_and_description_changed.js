/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Metadata_Title_And_Description_ChangedInputs */

const en_audit_metadata_title_and_description_changed = /** @type {(inputs: Audit_Metadata_Title_And_Description_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Title and description changed`)
};

const es_audit_metadata_title_and_description_changed = /** @type {(inputs: Audit_Metadata_Title_And_Description_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Título y descripción cambiados`)
};

const en_xa2_audit_metadata_title_and_description_changed = /** @type {(inputs: Audit_Metadata_Title_And_Description_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìtlè ànd dèscrìptìòn chàngèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Title and description changed" |
*
* @param {Audit_Metadata_Title_And_Description_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_metadata_title_and_description_changed = /** @type {((inputs?: Audit_Metadata_Title_And_Description_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Metadata_Title_And_Description_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_metadata_title_and_description_changed(inputs)
	if (locale === "en-XA") return en_xa2_audit_metadata_title_and_description_changed(inputs)
	return en_audit_metadata_title_and_description_changed(inputs)
});