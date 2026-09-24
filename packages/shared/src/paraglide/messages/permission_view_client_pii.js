/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Client_PiiInputs */

const en_permission_view_client_pii = /** @type {(inputs: Permission_View_Client_PiiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View client PII`)
};

const es_permission_view_client_pii = /** @type {(inputs: Permission_View_Client_PiiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver datos personales del cliente`)
};

const en_xa2_permission_view_client_pii = /** @type {(inputs: Permission_View_Client_PiiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw clìènt PÌÌ •••••⟧`)
};

/**
* | output |
* | --- |
* | "View client PII" |
*
* @param {Permission_View_Client_PiiInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_client_pii = /** @type {((inputs?: Permission_View_Client_PiiInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Client_PiiInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_client_pii(inputs)
	if (locale === "en-XA") return en_xa2_permission_view_client_pii(inputs)
	return en_permission_view_client_pii(inputs)
});