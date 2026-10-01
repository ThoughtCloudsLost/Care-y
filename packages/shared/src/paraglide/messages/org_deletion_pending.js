/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ date: NonNullable<unknown> }} Org_Deletion_PendingInputs */

const en_org_deletion_pending = /** @type {(inputs: Org_Deletion_PendingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This organization will be deleted after ${i?.date}.`)
};

const es_org_deletion_pending = /** @type {(inputs: Org_Deletion_PendingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esta organización se eliminará después del ${i?.date}.`)
};

const en_xa2_org_deletion_pending = /** @type {(inputs: Org_Deletion_PendingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs òrgànìzàtìòn wìll bè dèlètèd àftèr  ••••••••••••${i?.date}. •⟧`)
};

/**
* | output |
* | --- |
* | "This organization will be deleted after {date}." |
*
* @param {Org_Deletion_PendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_pending = /** @type {((inputs: Org_Deletion_PendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_PendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_pending(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_pending(inputs)
	return en_org_deletion_pending(inputs)
});