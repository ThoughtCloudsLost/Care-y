/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_Reseal_ResumeInputs */

const en_admin_keys_reseal_resume = /** @type {(inputs: Admin_Keys_Reseal_ResumeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resume`)
};

const es_admin_keys_reseal_resume = /** @type {(inputs: Admin_Keys_Reseal_ResumeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reanudar`)
};

/**
* | output |
* | --- |
* | "Resume" |
*
* @param {Admin_Keys_Reseal_ResumeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_resume = /** @type {((inputs?: Admin_Keys_Reseal_ResumeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Reseal_ResumeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_reseal_resume(inputs)
	return en_admin_keys_reseal_resume(inputs)
});