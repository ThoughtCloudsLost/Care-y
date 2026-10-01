/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_RequestedInputs */

const en_org_deletion_requested = /** @type {(inputs: Org_Deletion_RequestedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deletion requested`)
};

const es_org_deletion_requested = /** @type {(inputs: Org_Deletion_RequestedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminación solicitada`)
};

const en_xa2_org_deletion_requested = /** @type {(inputs: Org_Deletion_RequestedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètìòn rèqùèstèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Deletion requested" |
*
* @param {Org_Deletion_RequestedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_requested = /** @type {((inputs?: Org_Deletion_RequestedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_RequestedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_requested(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_requested(inputs)
	return en_org_deletion_requested(inputs)
});