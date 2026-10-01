/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_Confirm_LabelInputs */

const en_org_deletion_confirm_label = /** @type {(inputs: Org_Deletion_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization address`)
};

const es_org_deletion_confirm_label = /** @type {(inputs: Org_Deletion_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dirección de la organización`)
};

const en_xa2_org_deletion_confirm_label = /** @type {(inputs: Org_Deletion_Confirm_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn àddrèss ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization address" |
*
* @param {Org_Deletion_Confirm_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_confirm_label = /** @type {((inputs?: Org_Deletion_Confirm_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Confirm_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_confirm_label(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_confirm_label(inputs)
	return en_org_deletion_confirm_label(inputs)
});