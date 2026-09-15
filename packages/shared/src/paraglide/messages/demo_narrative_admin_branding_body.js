/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Branding_BodyInputs */

const en_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name, primary and accent colors, logo, and client facing text are stored as plaintext on the server so pre auth pages can display them without decryption.
**App icon.** When a logo is uploaded it is used as the app icon when visitors add the site to their home screens or desktop.
**Contrast enforcement.** The branding editor enforces WCAG AA contrast ratios. If the chosen brand color does not meet the 4.5:1 ratio against its background, the system adjusts it at runtime in both light and dark mode.
**Preview.** The editor shows a live preview of buttons, badges, links, and icons in the chosen colors before saving.`)
};

const es_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de la organización, los colores principal y de acento, el logotipo y el texto visible para clientes se almacenan en texto plano en el servidor para que las páginas previas a la autenticación puedan mostrarlos sin descifrado.
**Icono de la aplicación.** Cuando se sube un logotipo, se usa como el icono de la aplicación cuando los visitantes añaden el sitio a sus pantallas de inicio o escritorio.
**Contraste forzado.** El editor de marca aplica relaciones de contraste WCAG AA. Si el color de marca elegido no cumple la relación 4.5:1 contra su fondo, el sistema lo ajusta en tiempo de ejecución tanto en modo claro como oscuro.
**Vista previa.** El editor muestra una vista previa en tiempo real de botones, insignias, enlaces e iconos en los colores elegidos antes de guardar.`)
};

/**
* | output |
* | --- |
* | "Organization name, primary and accent colors, logo, and client facing text are stored as plaintext on the server so pre auth pages can display them without d..." |
*
* @param {Demo_Narrative_Admin_Branding_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_branding_body = /** @type {((inputs?: Demo_Narrative_Admin_Branding_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Branding_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_branding_body(inputs)
	return en_demo_narrative_admin_branding_body(inputs)
});