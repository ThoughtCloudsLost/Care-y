/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Forms_DescInputs */

const en_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The form builder is where intake forms are authored, localized, previewed, and configured. Form definitions are encrypted under a key anyone can derive from the organization's public key, while responses are encrypted to private keys and gated by a separate permission.`)
};

const es_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El constructor de formularios es donde se crean, traducen, previsualizan y configuran los formularios de admisión. Las definiciones de formularios se cifran con una clave que cualquier persona puede derivar de la clave pública de la organización, mientras que las respuestas se cifran con claves privadas y están controladas por un permiso aparte.`)
};

/**
* | output |
* | --- |
* | "The form builder is where intake forms are authored, localized, previewed, and configured. Form definitions are encrypted under a key anyone can derive from ..." |
*
* @param {Demo_Section_Admin_Forms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_forms_desc = /** @type {((inputs?: Demo_Section_Admin_Forms_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Forms_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_forms_desc(inputs)
	return en_demo_section_admin_forms_desc(inputs)
});