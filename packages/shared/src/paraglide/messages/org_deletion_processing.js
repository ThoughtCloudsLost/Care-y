/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_ProcessingInputs */

const en_org_deletion_processing = /** @type {(inputs: Org_Deletion_ProcessingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This organization is being deleted.`)
};

const es_org_deletion_processing = /** @type {(inputs: Org_Deletion_ProcessingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta organización se está eliminando.`)
};

const en_xa2_org_deletion_processing = /** @type {(inputs: Org_Deletion_ProcessingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs òrgànìzàtìòn ìs bèìng dèlètèd. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This organization is being deleted." |
*
* @param {Org_Deletion_ProcessingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_processing = /** @type {((inputs?: Org_Deletion_ProcessingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_ProcessingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_processing(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_processing(inputs)
	return en_org_deletion_processing(inputs)
});