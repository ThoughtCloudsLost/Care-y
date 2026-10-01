/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_DoneInputs */

const en_org_deletion_done = /** @type {(inputs: Org_Deletion_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This organization has been deleted.`)
};

const es_org_deletion_done = /** @type {(inputs: Org_Deletion_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta organización se ha eliminado.`)
};

const en_xa2_org_deletion_done = /** @type {(inputs: Org_Deletion_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs òrgànìzàtìòn hàs bèèn dèlètèd. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This organization has been deleted." |
*
* @param {Org_Deletion_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_done = /** @type {((inputs?: Org_Deletion_DoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_DoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_done(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_done(inputs)
	return en_org_deletion_done(inputs)
});