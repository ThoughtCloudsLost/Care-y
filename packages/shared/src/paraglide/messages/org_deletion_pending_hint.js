/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_Pending_HintInputs */

const en_org_deletion_pending_hint = /** @type {(inputs: Org_Deletion_Pending_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Until then, an administrator can stop the deletion.`)
};

const es_org_deletion_pending_hint = /** @type {(inputs: Org_Deletion_Pending_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hasta entonces, un administrador puede detener la eliminación.`)
};

const en_xa2_org_deletion_pending_hint = /** @type {(inputs: Org_Deletion_Pending_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùntìl thèn, àn àdmìnìstràtòr càn stòp thè dèlètìòn. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Until then, an administrator can stop the deletion." |
*
* @param {Org_Deletion_Pending_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_pending_hint = /** @type {((inputs?: Org_Deletion_Pending_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Pending_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_pending_hint(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_pending_hint(inputs)
	return en_org_deletion_pending_hint(inputs)
});