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

const en_xa2_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fòrm bùìldèr ìs whèrè ìntàkè fòrms àrè àùthòrèd, lòcàlìzèd, prèvìèwèd, ànd cònfìgùrèd. Fòrm dèfìnìtìòns àrè èncryptèd ùndèr à kèy ànyònè càn dèrìvè fròm thè òrgànìzàtìòn's pùblìc kèy, whìlè rèspònsès àrè èncryptèd tò prìvàtè kèys ànd gàtèd by à sèpàràtè pèrmìssìòn. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The form builder is where intake forms are authored, localized, previewed, and configured. Form definitions are encrypted under a key anyone can derive from ..." |
*
* @param {Demo_Section_Admin_Forms_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_forms_desc = /** @type {((inputs?: Demo_Section_Admin_Forms_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Forms_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_forms_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_forms_desc(inputs)
	return en_demo_section_admin_forms_desc(inputs)
});