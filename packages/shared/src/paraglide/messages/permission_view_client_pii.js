/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Client_PiiInputs */

const en_permission_view_client_pii = /** @type {(inputs: Permission_View_Client_PiiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`See full contact details`)
};

const es_permission_view_client_pii = /** @type {(inputs: Permission_View_Client_PiiInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver datos de contacto completos`)
};

/**
* | output |
* | --- |
* | "See full contact details" |
*
* @param {Permission_View_Client_PiiInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_client_pii = /** @type {((inputs?: Permission_View_Client_PiiInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Client_PiiInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_client_pii(inputs)
	return en_permission_view_client_pii(inputs)
});