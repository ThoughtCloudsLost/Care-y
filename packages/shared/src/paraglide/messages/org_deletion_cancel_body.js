/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ days: NonNullable<unknown> }} Org_Deletion_Cancel_BodyInputs */

const en_org_deletion_cancel_body = /** @type {(inputs: Org_Deletion_Cancel_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The organization and its data will be kept. A new request would start a new ${i?.days}-day waiting period.`)
};

const es_org_deletion_cancel_body = /** @type {(inputs: Org_Deletion_Cancel_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`La organización y sus datos se conservarán. Una nueva solicitud iniciaría un nuevo periodo de espera de ${i?.days} días.`)
};

const en_xa2_org_deletion_cancel_body = /** @type {(inputs: Org_Deletion_Cancel_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn ànd ìts dàtà wìll bè kèpt. À nèw rèqùèst wòùld stàrt à nèw  •••••••••••••••••••••••${i?.days}-dày wàìtìng pèrìòd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization and its data will be kept. A new request would start a new {days}-day waiting period." |
*
* @param {Org_Deletion_Cancel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_cancel_body = /** @type {((inputs: Org_Deletion_Cancel_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_Cancel_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_cancel_body(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_cancel_body(inputs)
	return en_org_deletion_cancel_body(inputs)
});