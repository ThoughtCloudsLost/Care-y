/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ slug: NonNullable<unknown> }} Org_Deletion_Confirm_HintInputs */

const en_org_deletion_confirm_hint = /** @type {(inputs: Org_Deletion_Confirm_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Type ${i?.slug} to confirm.`)
};

const es_org_deletion_confirm_hint = /** @type {(inputs: Org_Deletion_Confirm_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Escribe ${i?.slug} para confirmar.`)
};

const en_xa2_org_deletion_confirm_hint = /** @type {(inputs: Org_Deletion_Confirm_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Typè  ••${i?.slug} tò cònfìrm. ••••⟧`)
};

/**
* | output |
* | --- |
* | "Type {slug} to confirm." |
*
* @param {Org_Deletion_Confirm_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_confirm_hint = /** @type {((inputs: Org_Deletion_Confirm_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Confirm_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_confirm_hint(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_confirm_hint(inputs)
	return en_org_deletion_confirm_hint(inputs)
});