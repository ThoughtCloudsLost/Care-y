/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Roles_HeadingInputs */

const en_demo_entry_roles_heading = /** @type {(inputs: Demo_Entry_Roles_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role switching`)
};

const es_demo_entry_roles_heading = /** @type {(inputs: Demo_Entry_Roles_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambio de rol`)
};

const en_xa2_demo_entry_roles_heading = /** @type {(inputs: Demo_Entry_Roles_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròlè swìtchìng •••••⟧`)
};

/**
* | output |
* | --- |
* | "Role switching" |
*
* @param {Demo_Entry_Roles_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_roles_heading = /** @type {((inputs?: Demo_Entry_Roles_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Roles_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_roles_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_entry_roles_heading(inputs)
	return en_demo_entry_roles_heading(inputs)
});