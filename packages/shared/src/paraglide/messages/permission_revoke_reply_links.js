/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Revoke_Reply_LinksInputs */

const en_permission_revoke_reply_links = /** @type {(inputs: Permission_Revoke_Reply_LinksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revoke reply links`)
};

const es_permission_revoke_reply_links = /** @type {(inputs: Permission_Revoke_Reply_LinksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revocar enlaces de respuesta`)
};

/**
* | output |
* | --- |
* | "Revoke reply links" |
*
* @param {Permission_Revoke_Reply_LinksInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_revoke_reply_links = /** @type {((inputs?: Permission_Revoke_Reply_LinksInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Revoke_Reply_LinksInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_revoke_reply_links(inputs)
	return en_permission_revoke_reply_links(inputs)
});