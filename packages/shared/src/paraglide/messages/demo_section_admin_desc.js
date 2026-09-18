/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_DescInputs */

const en_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The landing page for organization management. Each destination requires a specific permission, and the hub shows only the destinations the current permission set includes. Since the permission matrix is configurable, two users with the same role title may see different destinations. Live counts on each destination double as health signals, switching to a warning style when a threshold is crossed.`)
};

const es_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de inicio para la gestión de la organización. Cada destino requiere un permiso específico, y el centro muestra solo los destinos que el conjunto de permisos actual incluye. Como la matriz de permisos es configurable, dos personas con el mismo título de rol pueden ver destinos diferentes. Los conteos en vivo de cada destino funcionan como señales de salud, cambiando a estilo de advertencia cuando se cruza un umbral.`)
};

/**
* | output |
* | --- |
* | "The landing page for organization management. Each destination requires a specific permission, and the hub shows only the destinations the current permission..." |
*
* @param {Demo_Section_Admin_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_desc = /** @type {((inputs?: Demo_Section_Admin_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_desc(inputs)
	return en_demo_section_admin_desc(inputs)
});