/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Branding_BodyInputs */

const en_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name, primary and accent colors, logo, and client facing text are all encrypted with the organization key before storage. The server stores ciphertext.
**Contrast enforcement.** The branding editor enforces WCAG AA contrast ratios. If an organization's chosen brand color does not meet the 4.5:1 ratio against its background, the system adjusts it at runtime in both light and dark mode.
**Preview.** The editor shows a live preview of buttons, badges, links, and icons in the chosen colors before saving.`)
};

const es_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de la organizacion, los colores principal y de acento, el logotipo y el texto visible para clientes se cifran con la clave de la organizacion antes de almacenarse. El servidor almacena texto cifrado.
**Contraste forzado.** El editor de marca aplica relaciones de contraste WCAG AA. Si el color de marca elegido por la organizacion no cumple la relacion 4.5:1 contra su fondo, el sistema lo ajusta en tiempo de ejecucion tanto en modo claro como oscuro.
**Vista previa.** El editor muestra una vista previa en tiempo real de botones, insignias, enlaces e iconos en los colores elegidos antes de guardar.`)
};

/**
* | output |
* | --- |
* | "Organization name, primary and accent colors, logo, and client facing text are all encrypted with the organization key before storage. The server stores ciph..." |
*
* @param {Demo_Narrative_Admin_Branding_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_branding_body = /** @type {((inputs?: Demo_Narrative_Admin_Branding_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Branding_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_branding_body(inputs)
	return es_demo_narrative_admin_branding_body(inputs)
});