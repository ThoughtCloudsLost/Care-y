/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ days: NonNullable<unknown> }} Org_Deletion_Request_BodyInputs */

const en_org_deletion_request_body = /** @type {(inputs: Org_Deletion_Request_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`All of this organization's data will be permanently erased once a ${i?.days}-day waiting period ends. An administrator can stop the deletion only during the waiting period.`)
};

const es_org_deletion_request_body = /** @type {(inputs: Org_Deletion_Request_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Todos los datos de esta organización se borrarán de forma permanente cuando termine un periodo de espera de ${i?.days} días. Un administrador solo puede detener la eliminación durante el periodo de espera.`)
};

const en_xa2_org_deletion_request_body = /** @type {(inputs: Org_Deletion_Request_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Àll òf thìs òrgànìzàtìòn's dàtà wìll bè pèrmànèntly èràsèd òncè à  ••••••••••••••••••••${i?.days}-dày wàìtìng pèrìòd ènds. Àn àdmìnìstràtòr càn stòp thè dèlètìòn ònly dùrìng thè wàìtìng pèrìòd. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "All of this organization's data will be permanently erased once a {days}-day waiting period ends. An administrator can stop the deletion only during the wait..." |
*
* @param {Org_Deletion_Request_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_request_body = /** @type {((inputs: Org_Deletion_Request_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Request_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_request_body(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_request_body(inputs)
	return en_org_deletion_request_body(inputs)
});