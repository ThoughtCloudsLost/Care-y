/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Request_Org_DeletionInputs */

const en_permission_request_org_deletion = /** @type {(inputs: Permission_Request_Org_DeletionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Request org deletion`)
};

const es_permission_request_org_deletion = /** @type {(inputs: Permission_Request_Org_DeletionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solicitar la eliminación de la organización`)
};

const en_xa2_permission_request_org_deletion = /** @type {(inputs: Permission_Request_Org_DeletionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèqùèst òrg dèlètìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Request org deletion" |
*
* @param {Permission_Request_Org_DeletionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_request_org_deletion = /** @type {((inputs?: Permission_Request_Org_DeletionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Request_Org_DeletionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_request_org_deletion(inputs)
	if (locale === "en-XA") return en_xa2_permission_request_org_deletion(inputs)
	return en_permission_request_org_deletion(inputs)
});