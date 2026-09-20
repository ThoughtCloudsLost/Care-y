/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Retention_Inactive_DescriptionInputs */

const en_admin_retention_inactive_description = /** @type {(inputs: Admin_Retention_Inactive_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Automatic deletion is off. ${i?.Tickets} and caller personal information are kept until manually deleted.`)
};

const es_admin_retention_inactive_description = /** @type {(inputs: Admin_Retention_Inactive_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`La eliminación automática está desactivada. Los ${i?.tickets} y la información personal de los llamantes se conservan hasta que se eliminen manualmente.`)
};

const en_xa2_admin_retention_inactive_description = /** @type {(inputs: Admin_Retention_Inactive_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Àùtòmàtìc dèlètìòn ìs òff.  •••••••••${i?.Tickets} ànd càllèr pèrsònàl ìnfòrmàtìòn àrè kèpt ùntìl mànùàlly dèlètèd. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Automatic deletion is off. {Tickets} and caller personal information are kept until manually deleted." |
*
* @param {Admin_Retention_Inactive_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_inactive_description = /** @type {((inputs: Admin_Retention_Inactive_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Inactive_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_inactive_description(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_inactive_description(inputs)
	return en_admin_retention_inactive_description(inputs)
});