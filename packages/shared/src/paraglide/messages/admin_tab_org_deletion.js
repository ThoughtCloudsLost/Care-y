/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_Org_DeletionInputs */

const en_admin_tab_org_deletion = /** @type {(inputs: Admin_Tab_Org_DeletionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deletion`)
};

const es_admin_tab_org_deletion = /** @type {(inputs: Admin_Tab_Org_DeletionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminación`)
};

const en_xa2_admin_tab_org_deletion = /** @type {(inputs: Admin_Tab_Org_DeletionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Deletion" |
*
* @param {Admin_Tab_Org_DeletionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_org_deletion = /** @type {((inputs?: Admin_Tab_Org_DeletionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_Org_DeletionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_tab_org_deletion(inputs)
	if (locale === "en-XA") return en_xa2_admin_tab_org_deletion(inputs)
	return en_admin_tab_org_deletion(inputs)
});