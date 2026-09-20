/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ org: NonNullable<unknown> }} Portal_Contact_FooterInputs */

const en_portal_contact_footer = /** @type {(inputs: Portal_Contact_FooterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This is what ${i?.org} has on file to reach you.`)
};

const es_portal_contact_footer = /** @type {(inputs: Portal_Contact_FooterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esta es la información que ${i?.org} tiene registrada para contactarte.`)
};

const en_xa2_portal_contact_footer = /** @type {(inputs: Portal_Contact_FooterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs ìs whàt  ••••${i?.org} hàs òn fìlè tò rèàch yòù. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This is what {org} has on file to reach you." |
*
* @param {Portal_Contact_FooterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_contact_footer = /** @type {((inputs: Portal_Contact_FooterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Contact_FooterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_contact_footer(inputs)
	if (locale === "en-XA") return en_xa2_portal_contact_footer(inputs)
	return en_portal_contact_footer(inputs)
});