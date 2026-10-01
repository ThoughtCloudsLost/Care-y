/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_Request_ButtonInputs */

const en_org_deletion_request_button = /** @type {(inputs: Org_Deletion_Request_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Request deletion`)
};

const es_org_deletion_request_button = /** @type {(inputs: Org_Deletion_Request_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solicitar eliminación`)
};

const en_xa2_org_deletion_request_button = /** @type {(inputs: Org_Deletion_Request_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèqùèst dèlètìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Request deletion" |
*
* @param {Org_Deletion_Request_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_request_button = /** @type {((inputs?: Org_Deletion_Request_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Request_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_request_button(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_request_button(inputs)
	return en_org_deletion_request_button(inputs)
});