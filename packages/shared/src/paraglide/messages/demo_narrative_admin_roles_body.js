/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roles_BodyInputs */

const en_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two reference pages state what a manager and what a volunteer are expected to be able to do, in fixed wording that no permission change rewrites. [[#permissions]]
**What each page reads from the server.** The manager page asks for every active queue and reports the open case count of each one beside the reader's own queues, so it reports depth for queues the reader is not a member of. The volunteer page asks only for the reader's own queues. Queue names arrive as organization-key ciphertext on both, and a name the browser cannot open is left as a placeholder rather than dropped. [[#metadata #encryption]]
**Where the wording can drift from the grant.** The capability lines are fixed text, while the permission set behind them is the organization's to edit, so a role whose matrix rows have been changed keeps reading the shipped description of itself. One volunteer line names shift management, which is in development. [The permission matrix](#admin-people/role-permissions) covers what an organization can change. [[#permissions #failure-states]]
**Who reaches which page.** The manager page sends an account without Manage users back to the overview. The volunteer page is open to any signed-in account, and everything it reports is the reader's own, so opening it says nothing about anyone else. [The permission system](#deep-dive/the-permission-system) covers how those checks are made. [[#permissions #privacy]]
**What the pages do not do yet.** The security status link on each page raises a notice instead of opening anything, and the tour replay on the volunteer page does the same. [[#failure-states]]`)
};

const es_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dos páginas de referencia indican qué se espera que pueda hacer una persona gestora y qué una persona voluntaria, con un texto fijo que ningún cambio de permisos reescribe. [[#permissions]]
**Qué lee cada página del servidor.** La página de gestión pide todas las colas activas e indica el recuento de casos abiertos de cada una junto a las colas propias de quien la abre, de modo que informa de la carga de colas de las que esa persona no es miembro. La página de voluntariado pide solo las colas propias de quien la abre. Los nombres de cola llegan como texto cifrado con la clave de la organización en las dos, y un nombre que el navegador no puede abrir se deja como marcador y no se descarta. [[#metadata #encryption]]
**Dónde el texto puede alejarse de la concesión.** Las líneas de capacidades son texto fijo, mientras que el conjunto de permisos que hay detrás lo edita la organización, así que un rol cuyas filas de la matriz se han cambiado sigue leyendo la descripción de sí mismo con la que se publicó. Una línea de voluntariado nombra la gestión de turnos, que está en desarrollo. [La matriz de permisos](#admin-people/role-permissions) trata lo que una organización puede cambiar. [[#permissions #failure-states]]
**Quién llega a cada página.** La página de gestión devuelve a la vista general a una cuenta que no tiene Gestionar usuarios. La página de voluntariado está abierta a cualquier cuenta con sesión iniciada, y todo lo que indica es de quien la abre, así que abrirla no dice nada de nadie más. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo se hacen esas comprobaciones. [[#permissions #privacy]]
**Lo que las páginas todavía no hacen.** El enlace de estado de seguridad de cada página muestra un aviso en lugar de abrir nada, y la repetición del recorrido guiado en la página de voluntariado hace lo mismo. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ròlè rèfèrèncè pàgès sùmmàrìzè whàt ùsèrs ìn èàch ròlè càn sèè ànd dò, ànd thè sècùrìty stàtùs lìnk òn èàch pàgè ìs ìn dèvèlòpmènt.
 •••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng thè ròlè rèfèrèncè pàgès rèqùìrès thè Mànàgè ùsèrs pèrmìssìòn. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Two reference pages state what a manager and what a volunteer are expected to be able to do, in fixed wording that no permission change rewrites. [[#permissi..." |
*
* @param {Demo_Narrative_Admin_Roles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roles_body = /** @type {((inputs?: Demo_Narrative_Admin_Roles_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roles_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_roles_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_roles_body(inputs)
	return en_demo_narrative_admin_roles_body(inputs)
});