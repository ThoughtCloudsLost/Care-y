/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Comms_DescInputs */

const en_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The communications page configures how the organization reaches clients by phone, text, and email.`)
};

const es_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de comunicaciones configura cómo la organización contacta a los clientes por teléfono, mensajes de texto y correo electrónico.`)
};

/**
* | output |
* | --- |
* | "The communications page configures how the organization reaches clients by phone, text, and email." |
*
* @param {Demo_Section_Admin_Comms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_comms_desc = /** @type {((inputs?: Demo_Section_Admin_Comms_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Comms_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_comms_desc(inputs)
	return en_demo_section_admin_comms_desc(inputs)
});