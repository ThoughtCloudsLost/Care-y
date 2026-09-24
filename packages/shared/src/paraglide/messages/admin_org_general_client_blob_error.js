/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_Client_Blob_ErrorInputs */

const en_admin_org_general_client_blob_error = /** @type {(inputs: Admin_Org_General_Client_Blob_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Name saved. The public login page could not be updated and will show the old name until branding is saved again.`)
};

const es_admin_org_general_client_blob_error = /** @type {(inputs: Admin_Org_General_Client_Blob_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre guardado. La página pública de inicio de sesión no se pudo actualizar y mostrará el nombre anterior hasta que se guarde la marca de nuevo.`)
};

const en_xa2_admin_org_general_client_blob_error = /** @type {(inputs: Admin_Org_General_Client_Blob_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nàmè sàvèd. Thè pùblìc lògìn pàgè còùld nòt bè ùpdàtèd ànd wìll shòw thè òld nàmè ùntìl bràndìng ìs sàvèd àgàìn. ••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Name saved. The public login page could not be updated and will show the old name until branding is saved again." |
*
* @param {Admin_Org_General_Client_Blob_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_client_blob_error = /** @type {((inputs?: Admin_Org_General_Client_Blob_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_Client_Blob_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_general_client_blob_error(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_general_client_blob_error(inputs)
	return en_admin_org_general_client_blob_error(inputs)
});