/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Org_Deletion_Request_TitleInputs */

const en_org_deletion_request_title = /** @type {(inputs: Org_Deletion_Request_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete this organization?`)
};

const es_org_deletion_request_title = /** @type {(inputs: Org_Deletion_Request_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Eliminar esta organización?`)
};

const en_xa2_org_deletion_request_title = /** @type {(inputs: Org_Deletion_Request_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè thìs òrgànìzàtìòn? ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete this organization?" |
*
* @param {Org_Deletion_Request_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_request_title = /** @type {((inputs?: Org_Deletion_Request_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Request_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_request_title(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_request_title(inputs)
	return en_org_deletion_request_title(inputs)
});