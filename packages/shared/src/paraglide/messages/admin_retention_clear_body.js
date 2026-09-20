/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Admin_Retention_Clear_BodyInputs */

const en_admin_retention_clear_body = /** @type {(inputs: Admin_Retention_Clear_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Closed ${i?.tickets} and caller personal information will be kept indefinitely until manually deleted.`)
};

const es_admin_retention_clear_body = /** @type {(inputs: Admin_Retention_Clear_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los ${i?.tickets} cerrados y la información personal de los llamantes se conservarán indefinidamente hasta que se eliminen manualmente.`)
};

const en_xa2_admin_retention_clear_body = /** @type {(inputs: Admin_Retention_Clear_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Clòsèd  •••${i?.tickets} ànd càllèr pèrsònàl ìnfòrmàtìòn wìll bè kèpt ìndèfìnìtèly ùntìl mànùàlly dèlètèd. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Closed {tickets} and caller personal information will be kept indefinitely until manually deleted." |
*
* @param {Admin_Retention_Clear_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_clear_body = /** @type {((inputs: Admin_Retention_Clear_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Clear_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_clear_body(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_clear_body(inputs)
	return en_admin_retention_clear_body(inputs)
});