/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_Cancel_ButtonInputs */

const en_org_deletion_cancel_button = /** @type {(inputs: Org_Deletion_Cancel_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stop deletion`)
};

const es_org_deletion_cancel_button = /** @type {(inputs: Org_Deletion_Cancel_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detener la eliminación`)
};

const en_xa2_org_deletion_cancel_button = /** @type {(inputs: Org_Deletion_Cancel_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stòp dèlètìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Stop deletion" |
*
* @param {Org_Deletion_Cancel_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_cancel_button = /** @type {((inputs?: Org_Deletion_Cancel_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Cancel_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_cancel_button(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_cancel_button(inputs)
	return en_org_deletion_cancel_button(inputs)
});