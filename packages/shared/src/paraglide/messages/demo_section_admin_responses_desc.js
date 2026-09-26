/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Responses_DescInputs */

const en_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The responses section holds the answers that intake forms have collected. The questions on a form are public, but the answers are encrypted per case to individual accounts and the server cannot read them. Reading answers requires the View intake responses permission, which is separate from the Manage intake forms permission that governs building and publishing. [How encryption works](#deep-dive/how-encryption-works) covers the two key trees, and [The permission system](#deep-dive/the-permission-system) covers how each grant is moved between roles.`)
};

const es_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de respuestas contiene las respuestas que los formularios de admisión han recopilado. Las preguntas de un formulario son públicas, pero las respuestas se cifran por caso a cuentas individuales y el servidor no puede leerlas. Leer las respuestas requiere el permiso Ver respuestas de ingreso, que es independiente del permiso Gestionar formularios de ingreso que gobierna la creación y publicación. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los dos árboles de claves, y [El sistema de permisos](#deep-dive/the-permission-system) trata cómo se traslada cada concesión entre roles.`)
};

const en_xa2_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè rèspònsès sèctìòn hòlds thè ànswèrs thàt ìntàkè fòrms hàvè còllèctèd. Thè qùèstìòns òn à fòrm àrè pùblìc, bùt thè ànswèrs àrè èncryptèd pèr càsè tò ìndìvìdùàl àccòùnts ànd thè sèrvèr cànnòt rèàd thèm. Rèàdìng ànswèrs rèqùìrès thè Vìèw ìntàkè rèspònsès pèrmìssìòn, whìch ìs sèpàràtè fròm thè Mànàgè ìntàkè fòrms pèrmìssìòn thàt gòvèrns bùìldìng ànd pùblìshìng. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè twò kèy trèès, ànd [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw èàch grànt ìs mòvèd bètwèèn ròlès. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The responses section holds the answers that intake forms have collected. The questions on a form are public, but the answers are encrypted per case to indiv..." |
*
* @param {Demo_Section_Admin_Responses_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_responses_desc = /** @type {((inputs?: Demo_Section_Admin_Responses_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Responses_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_responses_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_responses_desc(inputs)
	return en_demo_section_admin_responses_desc(inputs)
});