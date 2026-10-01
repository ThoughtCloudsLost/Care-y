/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_CancelledInputs */

const en_org_deletion_cancelled = /** @type {(inputs: Org_Deletion_CancelledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deletion stopped`)
};

const es_org_deletion_cancelled = /** @type {(inputs: Org_Deletion_CancelledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminación detenida`)
};

const en_xa2_org_deletion_cancelled = /** @type {(inputs: Org_Deletion_CancelledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètìòn stòppèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Deletion stopped" |
*
* @param {Org_Deletion_CancelledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_cancelled = /** @type {((inputs?: Org_Deletion_CancelledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_CancelledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_cancelled(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_cancelled(inputs)
	return en_org_deletion_cancelled(inputs)
});